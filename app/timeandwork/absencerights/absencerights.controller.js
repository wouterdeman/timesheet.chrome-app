'use strict';

angular.module('timesheetApp').controller('AbsencerightsController', function ($scope, $http, $location, AbsenceRightService, $ionicPopup, UserService) {
    $scope.year = parseInt(moment().format('YYYY'));
    $scope.doRefresh = doRefresh;
    $scope.prevYear = prevYear;
    $scope.nextYear = nextYear;
    $scope.remove = remove;
    $scope.showReorder = false;
    $scope.moveItem = moveItem;

    activate();

    function activate() {
        $scope.doRefresh();
    };

    function doRefresh() {
        AbsenceRightService.getAll($scope.year).then(function (absencerights) {
            UserService.getAll().then(function (users) {
                absencerights = _.map(absencerights, function (absenceright) {
                    absenceright.user = _.find(users, {
                        '_id': absenceright.entity
                    });
                    return absenceright;
                });

                absencerights = _.groupBy(absencerights, function (absenceright) {
                    return absenceright.user.firstname + ' ' + absenceright.user.lastname;
                });

                var result = [];
                for (var k in absencerights) {
                    result.push({
                        user: k,
                        rights: absencerights[k],
                        sumAvailable: absencerights[k].reduce(function (sum, right) {
                            return sum + (right.amount - right.used);
                        }, 0)
                    });
                }

                $scope.absencerights = result;
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
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

    function remove(id) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete',
            template: 'Are you sure you want to delete this absenceright?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                AbsenceRightService.remove(id).then(function () {
                    $scope.doRefresh();
                });
            }
        });
    };

    function moveItem(right, rights, fromIndex, toIndex) {
        rights.splice(fromIndex, 1);
        rights.splice(toIndex, 0, right);
        _.forEach(rights, function (r, index) {
            if (r.seqnr != index) {
                r.seqnr = index;
                AbsenceRightService.update(r._id, r);
            }
        });
    };
});
