'use strict';

angular.module('timesheetApp')
    .controller('IntroController', function ($scope, $http, chromeApp, $ionicSlideBoxDelegate, $state) {
        //$scope.introDeviceName = "";
        activate();

        function activate() {
            chrome.storage.local.get("devicename", function (value) {
                var val = value["devicename"];
                $scope.$apply(function () {
                    $scope.introDeviceName = val || "";
                });
            });
        };

        // Called to navigate to the main app
        $scope.startApp = function () {
            chromeApp.storeLocally({
                introran: true
            });
            $state.go('gretel.home');
        };
        $scope.next = function () {
            $ionicSlideBoxDelegate.select($ionicSlideBoxDelegate.next());
        };
        $scope.previous = function () {
            $ionicSlideBoxDelegate.select($ionicSlideBoxDelegate.previous());
        };
        $scope.go = function (index) {
            $ionicSlideBoxDelegate.select(index);
        };
        $scope.slideChanged = function (index) {
            $scope.slideIndex = index;
        };

        $scope.updateDeviceName = function (val) {
            chrome.storage.local.set({
                'devicename': val
            }, function () {});
        };
    });
