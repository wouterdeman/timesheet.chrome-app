'use strict'

angular.module('timesheetApp', ['ngRoute']).config(function($routeProvider) {
  $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
      })
      .when('/addlocation', {
        controller:'LocationController',
        templateUrl:'views/addlocation.html'
      })
      .otherwise({
        redirectTo: '/'
      });
});