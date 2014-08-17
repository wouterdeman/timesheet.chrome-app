'use strict';

angular.module('timesheetApp')
    .controller('ErrorController', function ($scope, $http, $stateParams, $ionicLoading) {

        $scope.errorMessage= $stateParams.message || "Error occured";
        $ionicLoading.hide();

    });