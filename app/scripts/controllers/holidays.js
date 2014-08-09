'use strict';

angular.module('timesheetApp')
    .service('HolidayService', ['$http', '$q',
        function ($http, q) {
            return {
                getAll: function () {
                    var deferred = q.defer();
                    $http.get('http://timesheetservice.herokuapp.com/timeandwork/holidays').success(function (holidays) {
                        deferred.resolve(holidays);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                getById: function (id) {
                    var deferred = q.defer();
                    $http.get('http://timesheetservice.herokuapp.com/timeandwork/holidays/' + id).success(function (holiday) {
                        deferred.resolve(holiday);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function (holiday) {
                    var deferred = q.defer();
                    $http.post('http://timesheetservice.herokuapp.com/timeandwork/holidays', holiday).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                update: function (id, holiday) {
                    var deferred = q.defer();
                    $http.put('http://timesheetservice.herokuapp.com/timeandwork/holidays/' + id, holiday).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                remove: function (id) {
                    var deferred = q.defer();
                    $http.delete('http://timesheetservice.herokuapp.com/timeandwork/holidays/' + id).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                }
            };
        }
    ]).controller('HolidaysController', function ($scope, $http, $location, $ionicLoading, HolidayService, $state) {
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
            HolidayService.remove(id).then(function () {
                $scope.doRefresh();
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