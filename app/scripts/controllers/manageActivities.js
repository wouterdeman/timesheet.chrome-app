'use strict';

angular.module('timesheetApp')
    .controller('ManageActivitiesController', function ($scope, $http, $location) {
		var monthNames = [ "January", "February", "March", "April", "May", "June",
		    "July", "August", "September", "October", "November", "December" ];
    	var today=new Date();
    	var year=today.getFullYear();
        $scope.years=[year-1,year,year+1];
        $scope.selectedYear=year;
        $scope.months = monthNames.map(function(i,e){
        					return {id:e, name:i};
        				});
        $scope.selectedMonth=$scope.months[today.getMonth()];



        $scope.getTrackedTime=function(){

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
	        });
        };
    });