'use strict';

angular.module('timesheetApp')
    .service('FreezeService', ['$http', '$q', 'urls',
        function ($http, $q, urls) {
            var freeze = urls.absencemanagement.freeze;
            var getFrozen = urls.absencemanagement.getFrozen;
            return {
                get: function () {
                    var deferred = $q.defer();
                    $http.get(getFrozen).success(function (frozen) {
                        deferred.resolve(frozen ? frozen.date : null);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function (date) {
                    return $http.post(freeze, date);
                }
            };
        }
    ]).controller('FreezeController', function ($scope, $http, $location, FreezeService, $ionicPopup, dateFilter, $q) {
        var vm = this;
        vm.doRefresh = doRefresh;
        vm.save = save;

        var doRefresh = function () {
            FreezeService.get().then(function (date) {
                $scope.date = date ? dateFilter(date, 'yyyy-MM-dd') : date;
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        doRefresh();

        var save = function (valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }

            var date = $scope.date;
            var data = {
                year: dateFilter(date, 'yyyy'),
                month: dateFilter(date, 'MM'),
                day: dateFilter(date, 'dd'),
            };

            FreezeService.save(data).then(function (result) {
                var success = true;

                if (!result.data.success) {
                    success = false;
                    $ionicPopup.alert({
                        title: 'Freezing failed',
                        template: result.data.message
                    });
                }

                if (success) {
                    $state.back();
                }
            });
        };
    });
