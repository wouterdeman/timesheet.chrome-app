'use strict';

angular.module('timesheetApp')
	.controller('HomeController', function($scope, $http, $location, chromeApp) {
		$scope.loading = true;
		$scope.deviceName = '';

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
					if (zone && zone !== "0") {
						$scope.zone = zone;
						$scope.activity = _.find(zone.activities, {
							'active': true
						});
						chromeApp.showMessage('Zone found', 'You are now at ' + zone.zoneDetails.name);
					} else {
						$scope.zone = undefined;
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