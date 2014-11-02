'use strict';

angular.module('timesheetApp')
    .controller('HomeController', function ($scope, $http, $location, chromeApp, $ionicSideMenuDelegate, $state, SaldoService) {
        $scope.loading = false;
        $scope.deviceName = '';
        $scope.error = '';
        $scope.currentAddress = '';

        $scope.doRefresh = function () {
            SaldoService.getAll().then(function (saldos) {
                $scope.saldos = saldos;
            });

            chromeApp.getLastToken().then(function (token) {
                chromeApp.getLocation().then(function (coords) {
                    var loc = [coords.latitude, coords.longitude];
                    var url = 'http://timesheetservice.herokuapp.com/zones/current';
                    //var url = 'http://localhost:3000/zones/current';
                    var data = {
                        loc: loc,
                        token: token
                    };

                    $http.post(url, data).success(function (zone) {
                        if (zone && zone !== "0") {
                            $scope.zone = zone;
                            $scope.activity = _.find(zone.activities, {
                                'active': true
                            });
                        } else {
                            $scope.zone = undefined;
                            chromeApp.showMessage('Zone not found', 'Click here to register your current location as a zone if it means something to you (e.g home, workplace, etc...).').then(function () {
                                $location.path("/registerzone");
                                $scope.$apply();
                            });
                        }
                    }).error(function (a) {
                        $scope.error = "Unable to get " + url + " status " + a;
                    }).finally(function () {
                        // Stop the ion-refresher from spinning
                        $scope.$broadcast('scroll.refreshComplete');
                    });

                    $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coords.latitude + "," + coords.longitude + "&key=AIzaSyBrxt1UXQXNNfpPAkBJBLKeUj9XN2tZXlo").success(function (data) {
                        if (data.status === "OK") {
                            $scope.currentAddress = data.results[0].formatted_address;
                        }
                    });
                });
            });
        };

        chromeApp.retrieveLocally('introran').done(function (introran) {
            if (!introran || $http.defaults.headers.common.token === 'dummy') {
                $state.go('gretel.intro');
                return;
            }

            if (!$scope.zone) {
                $scope.doRefresh();
            }

            chrome.storage.local.get("devicename", function (value) {
                var val = value["devicename"];
                $scope.deviceName = val || "";
            });
        });
    });
