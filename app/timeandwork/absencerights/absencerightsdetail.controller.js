'use strict';

angular.module('timesheetApp').controller('AbsencerightsDetailController', function ($stateParams, $scope, AbsenceRightService, dateFilter, $state, UserService) {
    var id = $stateParams.id;
    var entity = $stateParams.entity;
    $scope.absenceright = {
        name: '',
        amount: '',
        year: '',
        entity: entity,
        monthly: false,
        seqnr: 0
    };
    $scope.save = save;

    activate();

    function activate() {
        if (id) {
            AbsenceRightService.getById(id).then(function (absenceright) {
                $scope.absenceright = absenceright;
            });
        }

        UserService.getAll().then(function (users) {
            $scope.users = users;
        });
    };

    function save(valid) {
        $scope.submitted = true;
        if (!valid) {
            return;
        }
        var absenceright = $scope.absenceright;
        var data = {
            name: absenceright.name,
            amount: absenceright.amount,
            year: absenceright.year,
            entity: absenceright.entity,
            monthly: absenceright.monthly,
            seqnr: absenceright.seqnr
        };

        //existing absenceright
        if (absenceright._id) {
            AbsenceRightService.update(absenceright._id, data).then(function () {
                $state.go('gretel.absencerights.list');
            });
        } else {
            AbsenceRightService.save(data).then(function () {
                $state.go('gretel.absencerights.list');
            });
        }
    };
});
