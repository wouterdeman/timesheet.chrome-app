'use strict';

angular.module('timesheetApp')
    .controller('AbsencemanagementController', function ($scope, $http, $location, AbsencemanagementService, UserService, AbsenceRightService, $ionicPopup, dateFilter, $q) {
        $scope.year = parseInt(moment().format('YYYY'));
        $scope.doRefresh = doRefresh;
        $scope.prevYear = prevYear;
        $scope.nextYear = nextYear;
        $scope.remove = remove;

        activate();

        function activate() {
            $scope.doRefresh();
        };

        function doRefresh() {
            AbsenceRightService.getAll($scope.year).then(function (absencerights) {
                UserService.getAll().then(function (users) {
                    AbsencemanagementService.getAll($scope.year).then(function (absences) {
                        UserService.getAll().then(function (users) {
                            absencerights = _.groupBy(absencerights, function (absenceright) {
                                return absenceright.entity;
                            });

                            absences = _.map(absences, function (absence) {
                                absence.user = _.find(users, {
                                    '_id': absence.entity
                                });
                                return absence;
                            });

                            absences = _.sortBy(absences, function (absence) {
                                var t = new Date(absence.date);
                                return t.getTime();
                            });

                            var groupedAbsences = _.groupBy(absences, function (absence) {
                                return absence.entity;
                            });

                            var entityGroups = [];
                            _.forEach(groupedAbsences, function (groupedAbsences) {
                                var totalAvailable = absencerights[groupedAbsences[0].entity].reduce(function (sum, right) {
                                    return sum + (right.amount - right.used);
                                }, 0);

                                entityGroups.push({
                                    entity: groupedAbsences[0].entity,
                                    user: groupedAbsences[0].user,
                                    absences: groupedAbsences,
                                    futureGroups: [],
                                    pastGroups: [],
                                    showFutureGroups: false,
                                    showPastGroups: false,
                                    totalAvailable: totalAvailable
                                });
                            });

                            _.forEach(entityGroups, function (entityGroup) {
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

                                _.forEach(entityGroup.absences, function (absence) {
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

                                entityGroup.futureGroups = _.filter(groups, function (group) {
                                    return new Date(group.startdate) >= today || new Date(group.enddate) >= today;
                                });
                                entityGroup.futureSum = _.reduce(entityGroup.futureGroups, function (sum, item) {
                                    return sum + item.amount;
                                }, 0);

                                entityGroup.pastGroups = _.filter(groups, function (group) {
                                    return new Date(group.startdate) < today && new Date(group.enddate) && today;
                                });
                                entityGroup.pastSum = _.reduce(entityGroup.pastGroups, function (sum, item) {
                                    return sum + item.amount;
                                }, 0);
                            });

                            $scope.groups = entityGroups;
                        }).finally(function () {
                            // Stop the ion-refresher from spinning
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                    });
                });
            });
        };

        function prevYear() {
            $scope.year--;
            $scope.doRefresh();
        };

        function nextYear() {
            $scope.year++;
            $scope.doRefresh();
        };

        function remove(absences) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this absence?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    AbsencemanagementService.remove(absences).then(function () {
                        $scope.doRefresh();
                    });
                }
            });
        };
    });
