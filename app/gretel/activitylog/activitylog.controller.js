'use strict';

angular.module('timesheetApp')
    .controller('ActivityLogController', function ($scope, $http, $location, urls) {

        $scope.doRefresh = function () {
            chromeApp.getLastToken().then(function (token) {
                chromeApp.getOrCreateClientHash().then(function (clientToken) {
                    var url = urls.activitylog.last20;
                    var data = {
                        token: token,
                        object: clientToken
                    };

                    $http.post(url, data).success(function (activitylog) {
                        activitylog = _.map(activitylog, function (item) {
                            var t = new Date(item.endtime);
                            item.formattedTime = t.getDate() + "/" + (t.getMonth() + 1) + "/" + t.getFullYear() + ' ' + t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds();
                            return item;
                        });

                        $scope.activitylog = activitylog;
                    }).finally(function () {
                        // Stop the ion-refresher from spinning
                        $scope.$broadcast('scroll.refreshComplete');
                    });

                    $http.post(urls.activitylog.last12hours, {
                        object: clientToken
                    }).success(function (last12hours) {
                        last12hours = _.map(last12hours, function (item) {
                            return {
                                timestamp: moment(new Date(item._id.year, item._id.month, item._id.day, item._id.hour)),
                                count: item.count
                            };
                        });
                        initHighCharts(last12hours);
                    }).finally(function () {
                        // Stop the ion-refresher from spinning
                        $scope.$broadcast('scroll.refreshComplete');
                    });

                });
            });
        };

        $scope.doRefresh();

        $scope.swapChartType = function () {
            if (this.highchartsNG.options.chart.type === 'line') {
                this.highchartsNG.options.chart.type = 'bar'
            } else {
                this.highchartsNG.options.chart.type = 'line'
            }
        }

        function initHighCharts(data) {
            data = data.reverse();
            var xAxis = [];
            var crumbleCount = [];
            var xAxisValue = moment();
            _.forEach(data, function (item) {
                xAxis.push(item.timestamp.format('HH:00 DD/MM'));
                crumbleCount.push(item.count);
            });

            $scope.highchartsNG = {
                options: {
                    chart: {
                        type: 'line'
                    }
                },
                series: [{
                    name: "Amount of crumbles",
                    data: crumbleCount
                }],
                yAxis: {
                    title: {
                        text: "Crumbles"
                    }
                },
                xAxis: {
                    categories: xAxis
                },
                title: {
                    text: 'Last 12 hours'
                },
                loading: false
            };
        }
    });
