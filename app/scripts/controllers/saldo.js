'use strict';

angular.module('timesheetApp')
    .service('SaldoService', ['$http', '$q', 'urls',
        function ($http, q, urls) {
            var index = urls.saldo.index;
            return {
                getAll: function () {
                    var deferred = q.defer();
                    $http.get(index).success(function (saldos) {
                        deferred.resolve(saldos);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                }
            };
        }
    ]).controller('SaldoController', function ($scope, $http, $location, $ionicLoading, SaldoService) {
        //todo: refactor loading stuff in decorator
        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.doRefresh = function () {
            SaldoService.getAll().then(function (saldos) {
                $scope.saldos = saldos;
                $ionicLoading.hide();
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.doRefresh();
    });