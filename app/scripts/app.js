'use strict'

var timesheetApp = angular.module('timesheetApp', ['ngRoute']).config(function($routeProvider) {
  $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
      })
      .when('/registerzone', {
        controller:'RegisterZoneController',
        templateUrl:'views/registerzone.html'
      })
      .when('/changecustomer', {
        controller:'ChangeCustomerController',
        templateUrl:'views/changecustomer.html'
      })
      .when('/changezone', {
        controller:'ChangeZoneController',
        templateUrl:'views/changezone.html'
      })
      .when('/locationDetails', {
        controller:'LocationDetailsController',
        templateUrl:'views/locationDetails.html'
      })
      .when('/manageActivities',{
        controller:'ManageActivitiesController',
        templateUrl:'views/manageActivities.html'        
      })
      .otherwise({
        redirectTo: '/'
      });
});

timesheetApp.factory('chromeApp', function() {  
  return chromeApp;
});

timesheetApp.directive("controlGroup", function ($compile) {
    return {
        template:
        '<div class="control-group" ng-class="{ \'has-error\': isError && submitted, \'has-success\': !isError && submitted }">\
            <label class="control-label" for="{{for}}">{{label}}</label>\
            <div class="controls" ng-transclude></div>\
        </div>',

        replace: true,
        transclude: true,
        require: "^form",

        scope: {
            label: "@" // Gets the string contents of the `label` attribute
        },

        link: function (scope, element, attrs, formController) {
            // The <label> should have a `for` attribute that links it to the input.
            // Get the `id` attribute from the input element
            // and add it to the scope so our template can access it.
            var id = element.find(":input").attr("id");
            scope.for = id;

            // Get the `name` attribute of the input
            var inputName = element.find(":input").attr("name");
            // Build the scope expression that contains the validation status.
            // e.g. "form.example.$invalid"
            var errorExpression = [formController.$name, inputName, "$invalid"].join(".");
            // Watch the parent scope, because current scope is isolated.
            scope.$parent.$watch(errorExpression, function (isError) {
                scope.isError = isError;                
            });

            scope.$parent.$watch('submitted', function (isError) {
                scope.submitted = scope.$parent.submitted;
            });

            return $compile(element.find(":input"))(scope.$parent);
        }
    };
});