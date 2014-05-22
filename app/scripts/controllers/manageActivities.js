'use strict';

angular.module('timesheetApp')
    .controller('ManageActivitiesController', function ($scope, $http, $location, urls) {
		var monthNames = [ "January", "February", "March", "April", "May", "June",
		    "July", "August", "September", "October", "November", "December" ];
    	var today=new Date();
    	var year=today.getFullYear();
    	var currentDevice=-1;

        $scope.years=[year-1,year,year+1];
        $scope.selectedYear=year;
        $scope.months = monthNames.map(function(i,e){
        					return {id:e, name:i};
        				});
        $scope.selectedMonth=$scope.months[today.getMonth()];
        $scope.customers=[];
        $scope.trackedTimes=[];
         $scope.devices=[];
         $scope.selectedDevice;

         $scope.trackedTimesForDevice=function(){
         	var deviceId= $scope.selectedDevice;
         	return _.filter( $scope.trackedTimes,{device:deviceId});
         };


         //INIT
        chromeApp.getLastToken().then(function (token) {
            var getCustomerData = {
                token: token
            };

            $http.post(urls.customers.all, getCustomerData).success(function (customers) {
            	console.log("customers",customers);
                $scope.customers = customers;
            });
        });
        chromeApp.getClientHash().then(function(hash){
			currentDevice=hash;
        });

		//ACTIONS
        $scope.getTrackedTime=function(){
			chromeApp.getLastToken().then(function (token) {
	            var getCustomerData = {
	                token: token,
	                month:$scope.selectedMonth.id,
	                year:$scope.selectedYear
	            };

	            $http.post(urls.customers.trackedTimeAndCustomer, getCustomerData).success(function (trackedTime) {
	                console.log("trackedTime",trackedTime);
	                $scope.trackedTimes= _.forEach(trackedTime,function(tt){
	                	tt.date=new Date(tt.date);
	                	tt.isWeekend=tt.date.getDay()%6==0;
	                	tt.formattedDate=tt.date.getDate()+" "+monthNames[tt.date.getMonth()]+" "+tt.date.getFullYear();

                        var cd = 24 * 60 * 60 * 1000,
                            ch = 60 * 60 * 1000,
                            d = Math.floor(tt.duration / cd),
                            h = '0' + Math.floor( (tt.duration - d * cd) / ch),
                            m = '0' + Math.round( (tt.duration - d * cd - h * ch) / 60000);
                        tt.formattedDuration = [h.substr(-2), m.substr(-2)].join(':');
                        if(tt.suggestedCustomer) {
                            tt.customer = tt.suggestedCustomer;
                        }
	                });;

	                var grouped=_.groupBy(trackedTime,'device');
	               	var deviceIds=_.keys(grouped);
	               	var devices=_.map(deviceIds,function(deviceId){
	               		var name=_.first(grouped[deviceId]).devicedetails.devicetype;
	               		if(deviceId===currentDevice)
	               			name+=" (huidig)";
	               		return {id: deviceId, name:name};
	               	});

	                $scope.devices=devices;
	                $scope.selectedDevice=currentDevice;
	            });
	        });
        };


        $scope.saveActivity = function(trackedTimeForDevice){
        	var date=trackedTimeForDevice.date;
			chromeApp.getLastToken().then(function (token) {
	            var updateCustomerData = {
	                token: token,
					 day: date.getDate(),
				 	 month: date.getMonth(),
				 	 year: date.getFullYear(),
				 	 device:  $scope.selectedDevice,
				 	 customer: trackedTimeForDevice.customer
	            };

	            $http.post(urls.customers.updateCustomerForTrackedTime, updateCustomerData).success(function (response) {
	                console.log("updated",response);
	            });
	        });
        }
    });