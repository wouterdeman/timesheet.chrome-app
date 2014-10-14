'use strict';

angular.module('timesheetApp')
    .service('UserService', ['$http', '$q',
        function ($http, q) {
            return {
                getAll: function () {
                    var deferred = q.defer();
                    $http.get('http://timesheetservice.herokuapp.com/userstore/users').success(function (users) {
                        deferred.resolve(users);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                getById: function (id) {
                    var deferred = q.defer();
                    $http.get('http://timesheetservice.herokuapp.com/userstore/users/' + id).success(function (user) {
                        deferred.resolve(user);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function (holiday) {
                    var deferred = q.defer();
                    $http.post('http://timesheetservice.herokuapp.com/userstore/users', holiday).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                update: function (id, holiday) {
                    var deferred = q.defer();
                    $http.put('http://timesheetservice.herokuapp.com/userstore/users/' + id, holiday).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                remove: function (id) {
                    var deferred = q.defer();
                    $http.delete('http://timesheetservice.herokuapp.com/userstore/users/' + id).success(function () {
                        deferred.resolve();
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                }
            };
        }
    ]).controller('UsersController', function ($scope, $http, $location, UserService, $ionicPopup) {
        $scope.doRefresh = function () {
            UserService.getAll().then(function (users) {
                $scope.users = users;
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.doRefresh();

        $scope.remove = function (id) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this user?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    UserService.remove(id).then(function () {
                        $scope.doRefresh();
                    });
                }
            });
        };
    }).controller('UsersDetailController', function ($stateParams, $scope, UserService, dateFilter, $state) {
        var id = $stateParams.id;
        $scope.user = {
            firstname: '',
            lastname: '',
            emails: [{
                email: ''
            }]
        };
        if (id) {
            UserService.getById(id).then(function (user) {
                user.emails = _.map(user.emails, function (item) {
                    return {
                        email: item
                    };
                })
                $scope.user = user;
            });
        }

        $scope.saveUser = function (valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }
            var user = $scope.user;
            var data = {
                firstname: user.firstname,
                lastname: user.lastname,
                emails: _.map(user.emails, function (item) {
                    return item.email;
                })
            };

            //existing user
            if (user._id) {
                UserService.update(user._id, data).then(function () {
                    $state.go('gretel.users.list');
                });
            } else {
                UserService.save(data).then(function () {
                    $state.go('gretel.users.list');
                });
            }
        };

        $scope.addEmail = function () {
            $scope.user.emails.push({
                email: ''
            });
        };

        $scope.removeEmail = function (index) {
            $scope.user.emails.splice(index, 1);
        };
    });
