'use strict';

angular.module('timesheetApp')
	.controller('HomeController', function($scope, $http) {

		$http.get('http://timesheetservice.herokuapp.com/dashboard/last10').success(function(data) {
				$scope.last10 = data;
			});

		navigator.geolocation.getCurrentPosition(function(position) {
			$scope.currentPosition = position.coords;
		}, function(err) {			
			console.log("Error getting current position", err);
		});
	});