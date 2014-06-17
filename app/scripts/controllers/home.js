'use strict';

angular.module('timesheetApp')
	.controller('HomeController', function($scope, $http, $location, chromeApp) {
		$scope.loading = true;
		$scope.deviceName = '';
		$scope.currentlyTracking=false;
 
		$scope.trackingStatus = function(){
			if($scope.currentlyTracking)
				return 'Big brother is tracking you';

			return 'Big brother is sleeping';
		};

        var shouldSend=function(s){
            var currentDate=new Date();
            var currentDay=currentDate.getDay();
            var currentHour=currentDate.getHours();
            if(currentDay>0 && currentDay<6){
                if(!s.weekdays.track)
                    return false;
                return s.weekdays.from <= currentHour && s.weekdays.to>=currentHour;
            }
            if(!s.weekend.track)
                return false;
            return s.weekend.from  <= currentHour && s.weekend.to>=currentHour;
        };
        $scope.$on("settingschanged",function(d){
			$scope.currentlyTracking=shouldSend(d);
		});
		chrome.storage.local.get("settings",function(value){
			if(!value["settings"] )
				return;
            var val=value["settings"] ;
            $scope.currentlyTracking=shouldSend(val);
        });

		chromeApp.getLastToken().then(function (token) {
			chromeApp.getLocation().then(function (coords) {
				var loc = [coords.latitude, coords.longitude];
				var url = 'http://timesheetservice.herokuapp.com/zones/current';
				//var url = 'http://localhost:3000/zones/current';
				var data = {
					loc: loc,
					token: token
				};

				$http.post(url, data).success(function (zone) {
					$scope.zone = zone;
					if (zone) {
						$scope.activity = _.find(zone.activities, {
							'active': true
						});
						chromeApp.showMessage('Zone found', 'You are now at ' + zone.zoneDetails.name);
					} else {
						chromeApp.showMessage('Zone not found', 'Click here to register your current location as a zone if it means something to you (e.g home, workplace, etc...).').then(function () {							
							$location.path("/registerzone");
							$scope.$apply();
						});
					}
					$scope.loading = false;
				});
			});
		});


		chrome.storage.local.get("devicename",function(value){
			var val=value["devicename"];
			$scope.deviceName=val || "";
		});
	});