'use strict';

angular.module('timesheetApp')
    .controller('AbsencemanagementDetailController', function ($stateParams, $scope, AbsencemanagementService, UserService, dateFilter, $state, $ionicPopup) {
        var entity = $stateParams.entity;
        $scope.absence = {
            from: dateFilter(new Date(), 'yyyy-MM-dd'),
            to: dateFilter(new Date(), 'yyyy-MM-dd'),
            halfday: false,
            prenoon: "true",
            entity: entity
        };
        $scope.save = save;

        activate();

        function activate() {
            UserService.getAll().then(function (users) {
                $scope.users = users;
            });
        }

        function save(valid) {
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

            AbsencemanagementService.save(absenceToSave).then(function (result) {
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
