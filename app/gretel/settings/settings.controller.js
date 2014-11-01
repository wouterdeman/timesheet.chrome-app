'use strict';

angular.module('timesheetApp')
    .controller('settingsController', function ($scope, $http, $location) {

        chrome.storage.local.get("settings", function (value) {
            var val = value["settings"] || {};
            val.weekdays = val.weekdays || {
                track: true,
                from: 6,
                to: 20
            };
            val.weekdays.toggleTrack = function () {
                val.weekdays.track = !val.weekdays.track;
            };

            val.weekend = val.weekend || {
                track: false,
                from: 6,
                to: 20
            };
            val.weekend.toggleTrack = function () {
                val.weekend.track = !val.weekend.track;
            };

            $scope.weekdays = val.weekdays;
            $scope.weekend = val.weekend;
        });

        var handleWeekendWeekDaysSettings = function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }

            var data = {
                weekdays: $scope.weekdays,
                weekend: $scope.weekend
            }
            chrome.storage.local.set({
                'settings': data
            }, function () {
                $scope.$emit("settingschanged", data);
            });
        };

        $scope.$watch('weekdays.track', handleWeekendWeekDaysSettings);
        $scope.$watch('weekdays.from', handleWeekendWeekDaysSettings);
        $scope.$watch('weekdays.to', handleWeekendWeekDaysSettings);
        $scope.$watch('weekend.track', handleWeekendWeekDaysSettings);
        $scope.$watch('weekend.from', handleWeekendWeekDaysSettings);
        $scope.$watch('weekend.to', handleWeekendWeekDaysSettings);

        chrome.storage.local.get("devicename", function (value) {
            var val = value["devicename"];
            $scope.$apply(function () {
                $scope.devicename = val || "";
            });
        });

        $scope.$watch('devicename', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                chrome.storage.local.set({
                    'devicename': $scope.devicename
                }, function () {});
            }
        });

        $scope.debug = backgroundservice.debug;

        $scope.$watch('debug', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                backgroundservice.stop();
                backgroundservice.start(null, null, null, newValue);
            }
        });
    });
