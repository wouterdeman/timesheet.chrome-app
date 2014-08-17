'use strict';

angular.module('timesheetApp')
    .service('HolidayService', ['$http', '$q', 'urls',
        function ($http, q, urls) {
            var index=urls.holidays.index;
            var detail=urls.holidays.detail;
            return {
                getAll: function () {
                    var deferred = q.defer();
                    $http.get(index).success(function (holidays) {
                        deferred.resolve(holidays);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                getById: function (id) {
                    var deferred = q.defer();
                    $http.get(detail + id).success(function (holiday) {
                        deferred.resolve(holiday);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function (holiday) {
                    var deferred = q.defer();
                    $http.post(index, holiday).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                update: function (id, holiday) {
                    var deferred = q.defer();
                    $http.put(detail + id, holiday).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                remove: function (id) {
                    var deferred = q.defer();
                    $http.delete(detail + id).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                }
            };
        }
    ]).controller('HolidaysController', function ($scope, $http, $location, $ionicLoading, HolidayService, $ionicPopup) {
        //todo: refactor loading stuff in decorator
        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.doRefresh = function () {
            HolidayService.getAll().then(function (holidays) {
                $scope.holidays = holidays;
                $ionicLoading.hide();
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.doRefresh();

        $scope.remove = function (id) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this holiday?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    HolidayService.remove(id).then(function () {
                        $scope.doRefresh();
                    });
                }
            });
        };
    }).controller('HolidaysDetailController', function ($stateParams, $scope, HolidayService, dateFilter, $state) {
        var id = $stateParams.id;
        $scope.holiday = {
            name: '',
            date: ''
        };
        if (id) {
            HolidayService.getById(id).then(function (holiday) {
                holiday.date = dateFilter(new Date(holiday.date), 'yyyy-MM-dd');
                $scope.holiday = holiday;
            });
        }

        $scope.saveHoliday = function (valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }
            var holiday = $scope.holiday;
            var data = {
                name: holiday.name,
                year: dateFilter(new Date(holiday.date), 'yyyy'),
                month: dateFilter(new Date(holiday.date), 'MM'),
                day: dateFilter(new Date(holiday.date), 'dd')
            };

            //existing holiday
            if (holiday._id) {
                HolidayService.update(holiday._id, data).then(function () {
                    $state.go('gretel.holidays.list');
                });
            } else {
                HolidayService.save(data).then(function () {
                    $state.go('gretel.holidays.list');
                });
            }
        };
    });