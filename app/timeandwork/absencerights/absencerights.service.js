'use strict';

angular.module('timesheetApp')
    .service('AbsenceRightService', ['$http', '$q', 'urls',
        function ($http, q, urls) {
            var index = urls.absencerights.index;
            var detail = urls.absencerights.detail;
            return {
                getAll: function (year) {
                    var deferred = q.defer();
                    $http.get(index + '/' + year).success(function (absencerights) {
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
    ]);
