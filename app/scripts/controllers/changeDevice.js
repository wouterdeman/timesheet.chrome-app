'use strict';

angular.module('timesheetApp')
    .controller('ChangeDeviceController', function ($scope, $http, $location) {

       

		chrome.storage.local.get("devicename",function(value){
			var val=value["devicename"];
			$scope.$apply(function () {
	            $scope.devicename=val || "";
	        });
		});

    	$scope.changeDevice=function(theValue){
			chrome.storage.local.set({'devicename': theValue}, function() {
	          chromeApp.showMessage('Device', 'Device details saved.');
	        });
    	};

    });