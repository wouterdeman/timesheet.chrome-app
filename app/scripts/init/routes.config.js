(function () {
    //private helper function
    var condigCrudRoutes = function (stateprovider, name, dir) {
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
                        templateUrl: dir + '/' + name + '/' + name + '.html'
                    }
                }
            })
            .state('gretel.' + name + '.list', {
                url: "",
                templateUrl: dir + '/' + name + '/list.html',
                controller: nameCapitalized + 'Controller'
            })
            .state('gretel.' + name + '.edit', {
                url: "/edit/:id",
                templateUrl: dir + '/' + name + '/edit.html',
                controller: nameCapitalized + 'DetailController'
            })
            .state('gretel.' + name + '.add', {
                url: "/add/:entity",
                templateUrl: dir + '/' + name + '/edit.html',
                controller: nameCapitalized + 'DetailController'
            });
    };
    angular.module('timesheetApp').config(function ($provide, $stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('gretel', {
                url: "/gretel",
                abstract: true,
                templateUrl: "gretel/menu/menu.html"
            })
            .state('gretel.home', {
                url: "/home",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/home/home.html",
                        controller: "HomeController"
                    }
                }
            })
            .state('gretel.intro', {
                url: "/intro",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/intro/intro.html",
                        controller: "IntroController"
                    }
                }
            })
            .state('gretel.locationdetails', {
                url: "/locationdetails",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/locationdetails/locationDetails.html",
                        controller: "LocationDetailsController"
                    }
                }
            })
            .state('gretel.places', {
                url: "/places",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/places/places.html",
                        controller: "PlacesController"
                    }
                }
            })
            .state('gretel.manageactivities', {
                url: "/manageactivities",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/manageactivities/manageActivities.html",
                        controller: "ManageActivitiesController"
                    }
                }
            })
            .state('gretel.settings', {
                url: "/settings",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/settings/settings.html",
                        controller: "settingsController"
                    }
                }
            })
            .state('gretel.registerzone', {
                url: "/registerzone",
                views: {
                    'mainContent': {
                        templateUrl: "zonemanagement/registerzone.html",
                        controller: "RegisterZoneController"
                    }
                }
            })
            .state('gretel.changecustomer', {
                url: "/changecustomer",
                views: {
                    'mainContent': {
                        templateUrl: "zonemanagement/changecustomer.html",
                        controller: "ChangeCustomerController"
                    }
                }
            })
            .state('gretel.changezone', {
                url: "/changezone",
                views: {
                    'mainContent': {
                        templateUrl: "zonemanagement/changezone.html",
                        controller: "ChangeZoneController"
                    }
                }
            })
            .state('gretel.timesheet', {
                url: "/timesheet/summary",
                views: {
                    'mainContent': {
                        templateUrl: "timeandwork/timesheet/summary.html",
                        controller: "TimesheetController"
                    }
                }
            })
            .state('gretel.error', {
                url: "/error/:message",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/error/error.html",
                        controller: "ErrorController"
                    }
                }
            })
            .state('gretel.activitylog', {
                url: "/activitylog",
                views: {
                    'mainContent': {
                        templateUrl: "gretel/activitylog/activitylog.html",
                        controller: "ActivityLogController"
                    }
                }
            })
            .state('gretel.saldo', {
                url: "/saldo",
                views: {
                    'mainContent': {
                        templateUrl: "timeandwork/saldo/saldo.html",
                        controller: "SaldoController"
                    }
                }
            })
            .state('gretel.freeze', {
                url: "/freeze",
                views: {
                    'mainContent': {
                        templateUrl: "timeandwork/freeze/freeze.html",
                        controller: "FreezeController",
                        controllerAs: "vm"
                    }
                }
            });

        condigCrudRoutes($stateProvider, 'holidays', 'timeandwork');
        condigCrudRoutes($stateProvider, 'users', 'gretel');
        condigCrudRoutes($stateProvider, 'absencerights', 'timeandwork');
        condigCrudRoutes($stateProvider, 'absences', 'timeandwork');
        condigCrudRoutes($stateProvider, 'absencemanagement', 'timeandwork');

        $urlRouterProvider.otherwise("/gretel/home");

    }); //end config


    //end of (function(){
})();
