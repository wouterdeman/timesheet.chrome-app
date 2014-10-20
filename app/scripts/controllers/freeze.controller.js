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
    ]).controller('FreezeController', function ($http, $location, FreezeService, $ionicPopup, dateFilter, $state) {
        var vm = this;
        vm.doRefresh = doRefresh;
        vm.save = save;

        doRefresh();

        return vm;

        function doRefresh() {
            FreezeService.get().then(function (date) {
                vm.date = date ? dateFilter(date, 'yyyy-MM-dd') : date;
            }).finally(function () {
                // Stop the ion-refresher from spinning
                vm.$broadcast('scroll.refreshComplete');
            });
        };

        function save(valid) {
            vm.submitted = true;
            if (!valid) {
                return;
            }

            var date = vm.date;
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
                    $state.go('gretel.home');
                }
            });
        };
    });
