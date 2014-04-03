'use strict';

angular.module('timesheetApp')
    .controller('RegisterZoneController', function($scope, $http, $location) {        
        chromeApp.getLastToken().then(function(token) {
            var url = 'http://timesheetservice.herokuapp.com/customers/all';
            //var url = 'http://localhost:3000/customers/all';
            var data = {
                token: token
            };

            $http.post(url, data).success(function(customers) {
                $scope.customers = customers;
                if (customers.length > 0) {
                    $scope.customer = customers[0];
                }
            });
        });

        $scope.registerZone = function(valid) {
            $scope.submitted = true;
            if(!valid) {
                return;
            }
            chromeApp.getLastToken().then(function(token) {
                chromeApp.getLocation().then(function(coords) {
                    var loc = [coords.latitude, coords.longitude];
                    var data = {
                        token: token,
                        loc: loc,
                        name: $scope.name,
                        description: $scope.description,
                        customer: $scope.customer._id
                    };

                    var url = 'http://timesheetservice.herokuapp.com/zones/register';
                    //var url = 'http://localhost:3000/zones/register';
                    $http.post(url, data).success(function () {                 
                        chromeApp.showMessage('Zone registered', 'New zone ' + $scope.name + ' registered.');
                        $location.path("/");
                    });
                });
            });
        };
    });