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
                });
            });
        };

        $scope.doRefresh();
    });
