'use strict';

angular.module('timesheetApp')
    .controller('LocationDetailsController', function ($scope, $http, $location, $ionicLoading) {

        $ionicLoading.show({
          template: 'Loading...'
        });

        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.currentPosition = position.coords;
            $scope.$apply();
            $ionicLoading.hide();
        }, function (err) {
            console.log("Error getting current position", err);
        });
    });