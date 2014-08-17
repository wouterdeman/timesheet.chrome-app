'use strict'

var condigCrudRoutes = function (stateprovider, name) {
  var nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);

  //http://codepen.io/darrenahunter/pen/oDKid?editors=101
  stateprovider.state('gretel.' + name, {
    // With abstract set to true, that means this state can not be explicitly activated.
    // It can only be implicitly activated by activating one of it's children.
    abstract: true,
    // This abstract state will prepend '/contacts' onto the urls of all its children.
    url: '/' + name,
    views: {
      'mainContent': {
        templateUrl: 'views/' + name + '/' + name + '.html'
      }
    }
  })
    .state('gretel.' + name + '.list', {
      url: "",
      templateUrl: 'views/' + name + '/list.html',
      controller: nameCapitalized + 'Controller'
    })
    .state('gretel.' + name + '.edit', {
      url: "/edit/:id",
      templateUrl: 'views/' + name + '/edit.html',
      controller: nameCapitalized + 'DetailController'
    })
    .state('gretel.' + name + '.add', {
      url: "/add/:entity",
      templateUrl: 'views/' + name + '/edit.html',
      controller: nameCapitalized + 'DetailController'
    });
}

var timesheetApp = angular.module('timesheetApp', ['ionic']).config(function ($provide, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('gretel', {
      url: "/gretel",
      abstract: true,
      templateUrl: "views/menu.html"
    })
    .state('gretel.home', {
      url: "/home",
      views: {
        'mainContent': {
          templateUrl: "views/home.html",
          controller: "HomeController"
        }
      }
    })
    .state('gretel.locationdetails', {
      url: "/locationdetails",
      views: {
        'mainContent': {
          templateUrl: "views/locationDetails.html",
          controller: "LocationDetailsController"
        }
      }
    })
    .state('gretel.manageactivities', {
      url: "/manageactivities",
      views: {
        'mainContent': {
          templateUrl: "views/manageActivities.html",
          controller: "ManageActivitiesController"
        }
      }
    })
    .state('gretel.settings', {
      url: "/settings",
      views: {
        'mainContent': {
          templateUrl: "views/settings.html",
          controller: "settingsController"
        }
      }
    })
    .state('gretel.registerzone', {
      url: "/registerzone",
      views: {
        'mainContent': {
          templateUrl: "views/registerzone.html",
          controller: "RegisterZoneController"
        }
      }
    })
    .state('gretel.changecustomer', {
      url: "/changecustomer",
      views: {
        'mainContent': {
          templateUrl: "views/changecustomer.html",
          controller: "ChangeCustomerController"
        }
      }
    })
    .state('gretel.changezone', {
      url: "/changezone",
      views: {
        'mainContent': {
          templateUrl: "views/changezone.html",
          controller: "ChangeZoneController"
        }
      }
    })
    .state('gretel.error',{
       url: "/error/:message",
      views: {
        'mainContent': {
          templateUrl: "views/error.html",
          controller: "ErrorController"
        }
      }     
    })
    .state('gretel.activitylog', {
      url: "/activitylog",
      views: {
        'mainContent': {
          templateUrl: "views/activitylog.html",
          controller: "ActivityLogController"
        }
      }
    });

  condigCrudRoutes($stateProvider, 'holidays');
  condigCrudRoutes($stateProvider, 'users');
  condigCrudRoutes($stateProvider, 'absencerights');

  $urlRouterProvider.otherwise("/gretel/home");

  $provide.factory('urls', function () {
    var environment = "PRD";
    var urls = {
      customers: {
        all: "customers/all",
        trackedTimeAndCustomer: "customers/trackedTimeAndCustomer",
        updateCustomerForTrackedTime: "customers/updateCustomerForTrackedTime",
        copyReferencedTrackedTime: "customers/copyReferencedTrackedTime",
        deleteReferencedTrackedTime: "customers/deleteReferencedTrackedTime"
      }
    };
    var domain = {
      DEV: "http://localhost:3000/",
      PRD: 'http://timesheetservice.herokuapp.com/'
    };
    var completeUrls = {};

    for (var prop in urls) {
      if (urls.hasOwnProperty(prop)) {
        var entity = urls[prop]
        completeUrls[prop] = {};
        for (var action in entity) {
          if (entity.hasOwnProperty(action)) {
            completeUrls[prop][action] = domain[environment] + urls[prop][action];
          }
        }
      }
    }

    console.log(completeUrls);
    return completeUrls;
  });
});

timesheetApp.factory('chromeApp', function () {
  return chromeApp;
});

timesheetApp.directive("controlGroup", function ($compile) {
  return {
    template: '<div class="control-group" ng-class="{ \'has-error\': isError && submitted, \'has-success\': !isError && submitted }">\
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
      scope.
      for = id;

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

timesheetApp.run(function ($rootScope, $state, $http) {
  // you can inject any instance here
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
  });
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
    console.log('$stateChangeError - fired when an error occurs during transition.');
    console.log(arguments);
  });
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');

    chrome.storage.local.set({
      'latestState': toState.name,
      'latestParms': JSON.stringify(toParams)
    });


  });
  // $rootScope.$on('$viewContentLoading',function(event, viewConfig){
  //   // runs on individual scopes, so putting it in "run" doesn't work.
  //   console.log('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
  // });
  $rootScope.$on('$viewContentLoaded', function (event) {
    console.log('$viewContentLoaded - fired after dom rendered', event);
  });
  $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
    console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
    console.log(unfoundState, fromState, fromParams);
  });

  var startupBackgroundService = function (token) {
    // Start background service
    if (backgroundservice.available()) {
      chromeApp.getDeviceName().then(function (deviceName) {
        chromeApp.getOrCreateClientHash().then(function (clientToken) {

          var objectdetails = {
            appversion: 'Gretel', //manifest.name + '-' + manifest.version,
            devicetype: 'Chrome',
            devicestate: 'active',
            devicename: deviceName
          };

          backgroundservice.start(objectdetails, token, clientToken, true);
        });
      });
    }
  };

  chromeApp.getLastToken().then(function (token) {
    $http.defaults.headers.common.token = token;

    $http.get('http://timesheetservice.herokuapp.com/authstore/verify').success(function (valid) {
      if (!valid) {
        chromeApp.authenticateUser().then(function (token) {
          $http.defaults.headers.common.token = token;
          startupBackgroundService(token);
        });
      } else {
        startupBackgroundService(token);
      }
    }).error(function(data, status, headers, config) {
      $state.go("gretel.error", {message:"Unable to verify. Service is not available. Status "+status});
    });
  });

  //automaticly go to latest route (handy when debugging with livereload)
  chrome.storage.local.get('latestState', function (result) {
    chrome.storage.local.get('latestParms', function (res) {
      $state.go(result.latestState, JSON.parse(res['latestParms']));
    });
  });
  //when you screwed up, go back to default state :)
  //$state.go("gretel.home");

});