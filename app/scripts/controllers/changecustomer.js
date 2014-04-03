'use strict';

angular.module('timesheetApp')
    .controller('ChangeCustomerController', function($scope, $http, $location) {        
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

        $scope.changeCustomer = function() {
            chromeApp.getLastToken().then(function(token) {
                chromeApp.getLocation().then(function(coords) {
                    var loc = [coords.latitude, coords.longitude];
                    var data = {
                        token: token,
                        loc: loc,                       
                        customer: $scope.customer._id
                    };

                    var url = 'http://timesheetservice.herokuapp.com/zones/changecustomer';
                    //var url = 'http://localhost:3000/zones/changecustomer';
                    $http.post(url, data).success(function () {                                         
                        chromeApp.showMessage('Customer changed', 'You are now working for ' + $scope.customer.name);
                        $location.path("/");
                    });                                    
                });
            });
        };
    });