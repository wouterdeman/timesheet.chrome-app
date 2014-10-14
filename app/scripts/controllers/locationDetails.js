'use strict';

angular.module('timesheetApp')
    .controller('LocationDetailsController', function ($scope, $http, $location) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.currentPosition = position.coords;
            $scope.$apply();
        }, function (err) {
            console.log("Error getting current position", err);
        });
    });
