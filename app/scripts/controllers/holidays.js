'use strict';

angular.module('timesheetApp')
    .controller('HolidaysController', function ($scope, $http, $location, $ionicLoading) {

        $scope.holidays=[
            {name:"Onze Lieve Heer Hemelvaart", date: new Date(2014,8,15)},
            {name:"Wapenstilstand", date: new Date(2014,1,11)}
        ];

        $ionicLoading.show({
          template: 'Loading...'
        });

        $scope.edit=function(item){

        };

        $scope.shouldShowDelete=true;

        $ionicLoading.hide();

    });