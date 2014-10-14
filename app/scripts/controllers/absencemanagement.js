'use strict';

angular.module('timesheetApp')
    .service('AbsencemanagementService', ['$http', '$q', 'urls',
        function($http, $q, urls) {
            var index = urls.absencemanagement.index;
            var detail = urls.absencemanagement.detail;
            return {
                getAll: function() {
                    var deferred = $q.defer();
                    $http.get(index).success(function(absences) {
                        deferred.resolve(absences);
                    }).error(function(err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function(absence) {
                    return $http.post(index, absence);
                },
                remove: function(absences) {
                    var promises = absences.map(function(absence) {
                        return $http.delete(detail + absence._id);
                    });
                    return $q.all(promises);
                }
            };
        }
    ]).controller('AbsencemanagementController', function($scope, $http, $location, $ionicLoading, AbsencemanagementService, UserService, $ionicPopup, dateFilter, $q) {
        //todo: refactor loading stuff in decorator
        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.doRefresh = function() {
            AbsencemanagementService.getAll().then(function(absences) {
                UserService.getAll().then(function(users) {
                    absences = _.map(absences, function(absence) {
                        absence.user = _.find(users, {
                            '_id': absence.entity
                        });
                        return absence;
                    });

                    absences = _.sortBy(absences, function(absence) {
                        var t = new Date(absence.date);
                        return t.getTime();
                    });

                    var groupedAbsences = _.groupBy(absences, function(absence) {
                        return absence.entity;
                    });

                    var entityGroups = [];
                    _.forEach(groupedAbsences, function(groupedAbsences) {
                        entityGroups.push({
                            entity: groupedAbsences[0].entity,
                            user: groupedAbsences[0].user,
                            absences: groupedAbsences,
                            futureGroups: [],
                            pastGroups: [],
                            showFutureGroups: false,
                            showPastGroups: false
                        });
                    });

                    _.forEach(entityGroups, function(entityGroup) {
                        var groups = [];
                        var lastAbsence;
                        var group = {};

                        var initGroup = function(absence) {
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

                        _.forEach(entityGroup.absences, function(absence) {
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

                        groups = _.map(groups, function(group) {
                            group.startdateFormatted = dateFilter(group.startdate, 'EEE dd/MM/yy');
                            group.enddateFormatted = dateFilter(group.enddate, 'EEE dd/MM/yy');
                            return group;
                        });

                        groups = _.sortBy(groups, function(group) {
                            var t = new Date(group.startdate);
                            return -t.getTime();
                        });

                        var today = moment().startOf('day');

                        entityGroup.futureGroups = _.filter(groups, function(group) {
                            return new Date(group.startdate) >= today || new Date(group.enddate) >= today;
                        });
                        entityGroup.futureSum = _.reduce(entityGroup.futureGroups, function(sum, item) {
                            return sum + item.amount;
                        }, 0);

                        entityGroup.pastGroups = _.filter(groups, function(group) {
                            return new Date(group.startdate) < today && new Date(group.enddate) && today;
                        });
                        entityGroup.pastSum = _.reduce(entityGroup.pastGroups, function(sum, item) {
                            return sum + item.amount;
                        }, 0);
                    });

                    $scope.groups = entityGroups;
                    $ionicLoading.hide();
                });
            }).catch(function() {
                $ionicLoading.hide();
            }).finally(function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.doRefresh();

        $scope.remove = function(absences) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this absence?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    AbsencemanagementService.remove(absences).then(function() {
                        $scope.doRefresh();
                    });
                }
            });
        };
    }).controller('AbsencemanagementDetailController', function($stateParams, $scope, $ionicLoading, AbsencemanagementService, UserService, dateFilter, $state, $ionicPopup) {
        var entity = $stateParams.entity;
        $scope.absence = {
            from: dateFilter(new Date(), 'yyyy-MM-dd'),
            to: dateFilter(new Date(), 'yyyy-MM-dd'),
            halfday: false,
            prenoon: "true",
            entity: entity
        };

        $ionicLoading.show({
            template: 'Loading...'
        });
        UserService.getAll().then(function (users) {
            $scope.users = users;
            $ionicLoading.hide();
        });

        $scope.save = function(valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }

            var absence = $scope.absence;
            var absenceToSave = {
                fromYear: dateFilter(absence.from, 'yyyy'),
                fromMonth: dateFilter(absence.from, 'MM'),
                fromDay: dateFilter(absence.from, 'dd'),
                toYear: dateFilter(absence.to, 'yyyy'),
                toMonth: dateFilter(absence.to, 'MM'),
                toDay: dateFilter(absence.to, 'dd'),
                amount: 1,
                entity: absence.entity
            };

            if (absence.halfday) {
                absenceToSave.amount = 0.5;
                absenceToSave.prenoon = absence.prenoon;
            }

            AbsencemanagementService.save(absenceToSave).then(function(result) {
                var success = true;

                if (!result.data.success) {
                    success = false;
                    $ionicPopup.alert({
                        title: 'Absence registration failed',
                        template: result.data.message
                    });
                }

                if (success) {
                    $state.go('gretel.absencemanagement.list');
                }
            });
        };
    });