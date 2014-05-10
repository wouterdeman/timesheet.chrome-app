'use strict';

angular.module('timesheetApp')
    .controller('ManageActivitiesController', function ($scope, $http, $location, urls) {
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


        $scope.trackedTime=[];
/*
customers/trackedTimeAndCustomer
token: req.body.token,
 	 month: req.body.month,
 	 year: req.body.year
To list all available commands enter "/?".
	
Wouter Deman	3:16 PM
/customers/updateCustomerForTrackedTime
token: req.body.token,
 	 day: req.body.day,
 	 month: req.body.month,
 	 year: req.body.year,
 	 device: req.body.device,
 	 customer: req.body.customer
*/
        $scope.getTrackedTime=function(){

			chromeApp.getLastToken().then(function (token) {
	            var getCustomerData = {
	                token: token,
	                month:$scope.selectedMonth.id,
	                year:$scope.selectedYear
	            };

	            $http.post(urls.customers.trackedTimeAndCustomer, getCustomerData).success(function (trackedTime) {
	                console.log("trackedTime",trackedTime);
	            });
	        });
        };
    });