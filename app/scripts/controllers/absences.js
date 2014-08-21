'use strict';

angular.module('timesheetApp')
    .service('AbsenceService', ['$http', '$q', 'urls',
        function ($http, $q, urls) {
            var index = urls.absences.index;
            var detail = urls.absences.detail;
            return {
                getAll: function () {
                    var deferred = $q.defer();
                    $http.get(index).success(function (absences) {
                        deferred.resolve(absences);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function (absences) {
                    var promises = absences.map(function (absence) {
                        return $http.post(index, absence);
                    });

                    return $q.all(promises);
                },
                remove: function (absences) {
                    var promises = absences.map(function (absence) {
                        return $http.delete(detail + absence._id);
                    });
                    return $q.all(promises);
                }
            };
        }
    ]).controller('AbsencesController', function ($scope, $http, $location, $ionicLoading, AbsenceService, $ionicPopup, dateFilter, $q) {
        //todo: refactor loading stuff in decorator
        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.doRefresh = function () {
            AbsenceService.getAll().then(function (absences) {
                absences = _.sortBy(absences, function (absence) {
                    var t = new Date(absence.date);
                    return t.getTime();
                });

                var groups = [];
                var lastAbsence;
                var group = {};

                var initGroup = function (absence) {
                    lastAbsence = absence;
                    group = {};
                    group.startdate = absence.date;
                    group.amount = absence.amount;
                    group.enddate = absence.date;
                    group.prenoon = absence.prenoon;
                    group.absences = [];
                    group.absences.push(absence);
                    groups.push(group);
                };

                _.forEach(absences, function (absence) {
                    if (!lastAbsence) {
                        initGroup(absence);
                    } else {
                        var a = moment(group.enddate);
                        var b = moment(absence.date);
                        if (b.diff(a, 'days') === 1 && absence.amount === 1) {
                            group.enddate = absence.date;
                            group.amount += absence.amount;
                            group.absences.push(absence);
                        } else {
                            initGroup(absence);
                        }
                    }
                });

                groups = _.map(groups, function (group) {
                    group.startdateFormatted = dateFilter(group.startdate, 'EEE dd/MM/yy');
                    group.enddateFormatted = dateFilter(group.enddate, 'EEE dd/MM/yy');
                    return group;
                });

                groups = _.sortBy(groups, function (group) {
                    var t = new Date(group.startdate);
                    return -t.getTime();
                });

                var today = moment().startOf('day');

                var futureGroups = _.filter(groups, function (group) {
                    return new Date(group.startdate) >= today || new Date(group.enddate) >= today;
                });

                var pastGroups = _.filter(groups, function (group) {
                    return new Date(group.startdate) < today && new Date(group.enddate) && today;
                });

                $scope.futureGroups = futureGroups;
                $scope.pastGroups = pastGroups;
                $ionicLoading.hide();
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.doRefresh();

        $scope.remove = function (absences) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this absence?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    AbsenceService.remove(absences).then(function () {
                        $scope.doRefresh();
                    });
                }
            });
        };
    }).controller('AbsencesDetailController', function ($stateParams, $scope, AbsenceService, dateFilter, $state, $ionicPopup) {
        $scope.absence = {
            from: dateFilter(new Date(), 'yyyy-MM-dd'),
            to: dateFilter(new Date(), 'yyyy-MM-dd'),
            halfday: false,
            prenoon: "true"
        };

        $scope.save = function (valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }

            var absence = $scope.absence;
            var data = [];
            for (var d = new Date(absence.from); d <= new Date(absence.to); d.setDate(d.getDate() + 1)) {
                var dayOfWeek = d.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    var absenceToSave = {
                        year: dateFilter(d, 'yyyy'),
                        month: dateFilter(d, 'MM'),
                        day: dateFilter(d, 'dd'),
                        amount: 1
                    };

                    if (absence.halfday) {
                        absenceToSave.amount = 0.5;
                        absenceToSave.prenoon = absence.prenoon;
                    }

                    data.push(absenceToSave);
                }
            }

            AbsenceService.save(data).then(function (results) {
                var success = true;

                _.forEach(results, function (result) {
                    if (!result.data.success) {
                        success = false;
                        $ionicPopup.alert({
                            title: 'Absence registration failed',
                            template: result.data.message
                        });
                    }
                });

                if (success) {
                    $state.go('gretel.absences.list');
                }
            });
        };
    });