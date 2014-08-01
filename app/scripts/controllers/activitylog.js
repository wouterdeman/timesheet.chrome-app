'use strict';

angular.module('timesheetApp')
    .controller('ActivityLogController', function ($scope, $http, $location, $ionicLoading) {

        $scope.activitylog = [];

        $ionicLoading.show({
            template: 'Loading...'
        });

        $scope.doRefresh = function () {
            chromeApp.getLastToken().then(function (token) {
                chromeApp.getOrCreateClientHash().then(function (clientToken) {
                    var url = 'http://timesheetservice.herokuapp.com/activitylog/last20';
                    //var url = 'http://localhost:3000/activitylog/last20';
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
                        $ionicLoading.hide();
                    }).error(function () {
                        $ionicLoading.hide();
                    }).finally(function () {
                        // Stop the ion-refresher from spinning
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                });
            });
        };

        $scope.doRefresh();

        /*chrome.storage.local.get('activitylog', function (data) {
            data = (data['activitylog'] && JSON.parse(data['activitylog'])) || [];

            data = _.map(data, function (item) {
                var t = new Date(item.time);
                item.formattedTime = t.getDate() + "/" + (t.getMonth() + 1) + "/" + t.getFullYear() + ' ' + t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds();
                return item;
            });
            data = _.sortBy(data, function (item) {
                var t = new Date(item.time);
                return t.getDate() + "" + (t.getMonth() + 1) + "" + t.getFullYear();
            });
            data.reverse();

            data = _.groupBy(data, function (item) {
                var t = new Date(item.time);
                return t.getDate() + "/" + (t.getMonth() + 1) + "/" + t.getFullYear();
            });

            var result = [];
            for(var k in data) {                
                result.push({ key : k, values: data[k] });
            }            

            $scope.$apply(function () {
                $scope.activitylog = result;
            });
            $ionicLoading.hide();
        });*/
    });