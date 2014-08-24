'use strict';

angular.module('timesheetApp')
	.controller('HomeController', function ($scope, $http, $location, chromeApp, $ionicSideMenuDelegate, $ionicLoading, $state) {
		$scope.loading = false;
		$scope.deviceName = '';
		$scope.error = '';

		$scope.doRefresh = function () {
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
						} else {
							$scope.zone = undefined;
							chromeApp.showMessage('Zone not found', 'Click here to register your current location as a zone if it means something to you (e.g home, workplace, etc...).').then(function () {
								$location.path("/registerzone");
								$scope.$apply();
							});
						}
					}).error(function (a) {
						$scope.error = "Unable to get " + url + " status " + a;
					}).finally(function () {
						// Stop the ion-refresher from spinning
						$scope.$broadcast('scroll.refreshComplete');
					});
				});
			});
		};

		if (!$scope.zone) {
			$scope.doRefresh();
		}

		chrome.storage.local.get("devicename", function (value) {
			var val = value["devicename"];
			$scope.deviceName = val || "";
		});
	});