(function () {
  //private helper function
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
  };
  angular.module('timesheetApp').config(function ($provide, $stateProvider, $urlRouterProvider) {
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
      .state('gretel.timesheet', {
        url: "/timesheet/summary",
        views: {
          'mainContent': {
            templateUrl: "views/timesheet/summary.html",
            controller: "TimesheetController"
          }
        }
      })
      .state('gretel.error', {
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
      })
      .state('gretel.saldo', {
        url: "/saldo",
        views: {
          'mainContent': {
            templateUrl: "views/saldo.html",
            controller: "SaldoController"
          }
        }
      });

    condigCrudRoutes($stateProvider, 'holidays');
    condigCrudRoutes($stateProvider, 'users');
    condigCrudRoutes($stateProvider, 'absencerights');
    condigCrudRoutes($stateProvider, 'absences');

    $urlRouterProvider.otherwise("/gretel/home");

  }); //end config


  //end of (function(){ 
})();