'use strict';

angular.module('timesheetApp')
    .service('AbsencemanagementService', ['$http', '$q', 'urls',
        function ($http, $q, urls) {
            var index = urls.absencemanagement.index;
            var detail = urls.absencemanagement.detail;
            return {
                getAll: function (year) {
                    var deferred = $q.defer();
                    $http.get(index + '/' + year).success(function (absences) {
                        deferred.resolve(absences);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                save: function (absence) {
                    return $http.post(index, absence);
                },
                remove: function (absences) {
                    var promises = absences.map(function (absence) {
                        return $http.delete(detail + absence._id);
                    });
                    return $q.all(promises);
                }
            };
        }
    ]);
