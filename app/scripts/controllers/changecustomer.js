'use strict';

angular.module('timesheetApp')
    .controller('ChangeCustomerController', function ($scope, $http, $location) {
        chromeApp.getLastToken().then(function (token) {
            var url = 'http://timesheetservice.herokuapp.com/customers/all';
            //var url = 'http://localhost:3000/customers/all';
            var data = {
                token: token
            };

            $http.post(url, data).success(function (customers) {
                $scope.customers = customers;
                if (customers.length > 0) {
                    $scope.customer = customers[0];
                }
            });

            chromeApp.getLocation().then(function (coords) {
                var loc = [coords.latitude, coords.longitude];
                var getZoneUrl = 'http://timesheetservice.herokuapp.com/zones/current';
                //var url = 'http://localhost:3000/zones/current';
                var getZoneData = {
                    loc: loc,
                    token: token
                };

                $http.post(getZoneUrl, getZoneData).success(function (zone) {
                    var activity = _.find(zone.activities, {
                        'active': true
                    });
                    var customer = _.find($scope.customers, {
                        '_id': activity.activity
                    });
                    $scope.customer = customer;
                });
            });
        });

        $scope.changeCustomer = function () {
            chromeApp.getLastToken().then(function (token) {
                chromeApp.getLocation().then(function (coords) {
                    var loc = [coords.latitude, coords.longitude];
                    var data = {
                        token: token,
                        loc: loc,
                        customer: $scope.customer._id
                    };

                    var url = 'http://timesheetservice.herokuapp.com/zones/changecustomer';
                    //var url = 'http://localhost:3000/zones/changecustomer';
                    $http.post(url, data).success(function () {
                        $location.path("/");
                    });
                });
            });
        };
    });
