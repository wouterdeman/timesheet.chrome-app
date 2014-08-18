'use strict';

angular.module('timesheetApp')
    .service('AbsenceRightService', ['$http', '$q','urls',
        function ($http, q, urls) {
            var index=urls.absencerights.index;
            var detail=urls.absencerights.detail;
            return {
                getAll: function () {
                    var deferred = q.defer();
                    $http.get(index).success(function (absencerights) {
                        deferred.resolve(absencerights);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                getById: function (id) {
                    var deferred = q.defer();
                    $http.get(detail + id).success(function (absenceright) {
                        deferred.resolve(absenceright);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function (absenceright) {
                    var deferred = q.defer();
                    $http.post(detail, absenceright).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                update: function (id, absenceright) {
                    var deferred = q.defer();
                    $http.put(detail + id, absenceright).success(function () {
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
    ]).controller('AbsencerightsController', function ($scope, $http, $location, $ionicLoading, AbsenceRightService, $ionicPopup, UserService) {
        //todo: refactor loading stuff in decorator
        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.doRefresh = function () {
            AbsenceRightService.getAll().then(function (absencerights) {
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
                            rights: absencerights[k]
                        });
                    }

                    $scope.absencerights = result;
                    $ionicLoading.hide();
                }).finally(function () {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
            });
        };

        $scope.doRefresh();

        $scope.remove = function (id) {
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

        $scope.showReorder = false;

        $scope.moveItem = function (right, rights, fromIndex, toIndex) {            
            rights.splice(fromIndex, 1);
            rights.splice(toIndex, 0, right);
            _.forEach(rights, function(r, index) {
                if(r.seqnr != index) {
                    r.seqnr = index;
                    AbsenceRightService.update(r._id, r);
                }
            });
        };
    }).controller('AbsencerightsDetailController', function ($stateParams, $scope, AbsenceRightService, dateFilter, $state, UserService, $ionicLoading) {
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

        if (id) {
            AbsenceRightService.getById(id).then(function (absenceright) {
                $scope.absenceright = absenceright;
            });
        }

        $ionicLoading.show({
            template: 'Loading...'
        });
        UserService.getAll().then(function (users) {
            $scope.users = users;
            $ionicLoading.hide();
        });

        $scope.save = function (valid) {
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