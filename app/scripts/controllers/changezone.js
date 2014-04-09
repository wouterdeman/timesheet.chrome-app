'use strict';

angular.module('timesheetApp')
    .controller('ChangeZoneController', function ($scope, $http, $location) {
        chromeApp.getLastToken().then(function (token) {
            var getCustomerUrl = 'http://timesheetservice.herokuapp.com/customers/all';
            //var url = 'http://localhost:3000/customers/all';
            var getCustomerData = {
                token: token
            };

            $http.post(getCustomerUrl, getCustomerData).success(function (customers) {
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
                    $scope.name = zone.zoneDetails.name;
                    $scope.description = zone.zoneDetails.description;
                    $scope.zone = zone._id;

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

        $scope.updateZone = function (valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }
            chromeApp.getLastToken().then(function (token) {
                chromeApp.getLocation().then(function (coords) {
                    var loc = [coords.latitude, coords.longitude];
                    var data = {
                        token: token,
                        loc: loc,
                        name: $scope.name,
                        description: $scope.description,
                        customer: $scope.customer._id,
                        zone: $scope.zone
                    };

                    var url = 'http://timesheetservice.herokuapp.com/zones/update';
                    //var url = 'http://localhost:3000/zones/update';
                    $http.post(url, data).success(function () {
                        chromeApp.showMessage('Zone updated', 'Zone ' + $scope.name + ' updated.');
                        $location.path("/");
                    });
                });
            });
        };
    });