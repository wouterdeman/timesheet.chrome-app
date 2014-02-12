'use strict';

angular.module('timesheetApp')
	.controller('LocationController', function($scope, $http, $location) {
		
		$scope.addLocation = function() {			
		    console.log($scope.name + ' --- ' + $scope.description);
		    $location.path("/");
	  	};
	});