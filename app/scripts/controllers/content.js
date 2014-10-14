'use strict';

angular.module('timesheetApp')
    .controller('ContentController', function($scope, $http, $location, chromeApp, $ionicSideMenuDelegate) {
        $scope.currentlyTracking = false;
        $scope.deviceName = '';

        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
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
        $scope.$on("settingschanged",function(e, d){
            if (d.weekdays)
                $scope.currentlyTracking=shouldSend(d);
        });
        chrome.storage.local.get("settings",function(value){
            if(!value["settings"] )
                return;
            var val=value["settings"] ;
            $scope.currentlyTracking=shouldSend(val);
        });

        chrome.storage.local.get("devicename",function(value){
            var val=value["devicename"];
            $scope.deviceName=val || "";
        });

    });