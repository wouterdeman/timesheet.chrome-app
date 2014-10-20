'use strict';

angular.module('timesheetApp')
	.controller('ErrorController', function ($scope, $http, $stateParams, $ionicLoading) {

		$scope.errorMessage = $stateParams.message || "Error occured";
		$ionicLoading.hide();

		$scope.logs = [];
		var log = function (m) {
			$scope.logs.push(m);
		};

		$scope.clearLogs = function () {
			$scope.logs = [];
		};

		//TODO refactor, copy paste from app.run()
		$scope.retryAuthenticate = function () {
			var startupBackgroundService = function (token) {
				// Start background service
				log("Try start up background service");
				if (backgroundservice.available()) {
					chromeApp.getDeviceName().then(function (deviceName) {
						chromeApp.getOrCreateClientHash().then(function (clientToken) {
							log("Started backgroundservice for " + deviceName + " " + clientToken);;
							var objectdetails = {
								appversion: 'Gretel', //manifest.name + '-' + manifest.version,
								devicetype: 'Chrome',
								devicestate: 'active',
								devicename: deviceName
							};

							backgroundservice.start(objectdetails, token, clientToken, true);
						});
					});
				} else {
					log("No backgroundservice available");
				}
			};

			chromeApp.getLastToken().then(function (token) {
				log("Succesfully got last token", token);
				$http.defaults.headers.common.token = token;

				$http.get('http://timesheetservice.herokuapp.com/authstore/verify').success(function (valid) {
					log("Verified token in authstore: " + status);
					if (!valid || valid === "false") {
						log("Invalid token");
						chromeApp.authenticateUser().then(function (token) {
							log("chromeApp.authenticateUser() succeeded " + token);
							$http.defaults.headers.common.token = token;
							startupBackgroundService(token);
						}).fail(function (a, b, c, d) {
							log("chromeApp.authenticateUser() failed");
							$scope.errorMessage = "Unable to authenticateUser." + a + b + c + d;
						});
					} else {
						log("Valid token: " + valid);
						startupBackgroundService(token);
					}
				}).error(function (data, status, headers, config) {
					log("Unable to verify. Service is not available. Status " + status);
				});
			}).fail(function (e) {
				log("Failed to get last token", e);
			});

		};

	});