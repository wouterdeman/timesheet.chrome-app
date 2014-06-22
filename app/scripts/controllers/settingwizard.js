'use strict';
'use strict';

angular.module('timesheetApp')
    .controller('settingwizardController', function($scope, $http, $location) {        

  

        chrome.storage.local.get("settings",function(value){
            var val=value["settings"] || {};
            val.weekdays=val.weekdays ||{
                    track:true,
                    from:6,
                    to:20
                };
            val.weekdays.toggleTrack=function(){
                val.weekdays.track=!val.weekdays.track;
            };

            val.weekend=val.weekend ||{
                    track:false,
                    from:6,
                    to:20
                };
            val.weekend.toggleTrack=function(){
                val.weekend.track=!val.weekend.track;
            };
            $scope.$apply(function () {
                $scope.weekdays= val.weekdays;
                $scope.weekend=val.weekend;
            });
        });


        $scope.$watch(function(){
            var data = {
                weekdays:$scope.weekdays,
                weekend: $scope.weekend
            }
            chrome.storage.local.set({'settings': data}, function() {

                $scope.$emit("settingschanged",data);
                chromeApp.showMessage('Settings', 'Settings saved.');
            });
        });

    });