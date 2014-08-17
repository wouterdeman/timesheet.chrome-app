'use strict';

angular.module('timesheetApp')
    .service('AbsenceService', ['$http', '$q',
        function ($http, $q) {
            return {
                save: function (absences) {
                    var promises = absences.map(function (absence) {
                        return $http.post('http://localhost:3000/timeandwork/absences', absence);
                    });

                    return $q.all(promises);
                }
            };
        }
    ]).controller('EnterAbsenceController', function ($stateParams, $scope, AbsenceService, dateFilter, $state, $ionicPopup) {
        $scope.absence = {
            from: dateFilter(new Date(), 'yyyy-MM-dd'),
            to: dateFilter(new Date(), 'yyyy-MM-dd')
        };

        $scope.save = function (valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }

            var absence = $scope.absence;
            var data = [];
            for (var d = new Date(absence.from); d <= new Date(absence.to); d.setDate(d.getDate() + 1)) {
                data.push({
                    year: dateFilter(d, 'yyyy'),
                    month: dateFilter(d, 'MM'),
                    day: dateFilter(d, 'dd'),
                    amount: 1
                });
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
                    $state.go('gretel.home');
                }
            });
        };
    });