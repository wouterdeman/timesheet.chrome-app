'use strict';

angular.module('timesheetApp').config(['$httpProvider', function ($httpProvider) {
    var $http,
        interceptor = ['$q', '$injector', function ($q, $injector) {
            var error;

            function success(response) {
                // get $http via $injector because of circular dependency problem
                $http = $http || $injector.get('$http');
                var $ionicLoading = $ionicLoading || $injector.get('$ionicLoading');
                if ($http.pendingRequests.length < 1) {
                    $ionicLoading.hide();
                }
                return response;
            }

            function error(response) {
                // get $http via $injector because of circular dependency problem
                $http = $http || $injector.get('$http');
                var $ionicLoading = $ionicLoading || $injector.get('$ionicLoading');
                if ($http.pendingRequests.length < 1) {
                    $ionicLoading.hide();
                }
                return $q.reject(response);
            }

            return function (promise) {
                var $ionicLoading = $ionicLoading || $injector.get('$ionicLoading');
                $ionicLoading.show({
                    template: 'Loading...'
                });
                return promise.then(success, error);
            };
        }];

    $httpProvider.responseInterceptors.push(interceptor);
}]);
