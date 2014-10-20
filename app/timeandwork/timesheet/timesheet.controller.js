'use strict';

angular.module('timesheetApp')
    .service('TimesheetService', ['$http', '$q', 'urls',
        function ($http, q, urls) {
            var info = urls.timesheet.info;

            return {
                getInfo: function (data) {
                    var deferred = q.defer();
                    $http.post(info, data).success(function (info) {
                        deferred.resolve(info);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                getCustomers: function () {
                    var deferred = q.defer();
                    $http.get(urls.customers.all).success(function (info) {
                        deferred.resolve(info);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                }
            };
        }
    ]).controller('TimesheetController', function ($scope, TimesheetService, UserService, urls, chromeApp) {
        $scope.advancedSearch = false;
        $scope.year = new Date().getFullYear();
        $scope.month = new Date().getMonth();
        $scope.customers = [];
        $scope.customer;
        $scope.downloadUrl = urls.timesheet.download;
        chromeApp.getLastToken().then(function (token) {
            $scope.token = token;
        });
        $scope.info = {};
        $scope.getInfo = function () {
            if (!$scope.customer) {
                return;
            }
            var data = {
                month: $scope.month,
                year: $scope.year,
                customer: $scope.customer._id
            }
            TimesheetService.getInfo(data).then(function (info) {
                $scope.info = info.summary;
            });
        };

        TimesheetService.getCustomers()
            .then(function (customers) {
                $scope.customers = customers;
                $scope.customer = customers[0];

                $scope.getInfo();
            });

        $scope.$watch('year', $scope.getInfo);
        $scope.$watch('month', $scope.getInfo);
        $scope.$watch('customer', $scope.getInfo);
    });
