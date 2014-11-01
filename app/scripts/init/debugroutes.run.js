angular.module('timesheetApp').run(function ($rootScope, $state, $http) {
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


    //automaticly go to latest route (handy when debugging with livereload)
    chrome.storage.local.get('latestState', function (result) {
        chrome.storage.local.get('latestParms', function (res) {
            if (res['latestParms']) {
                $state.go(result.latestState, JSON.parse(res['latestParms']));
            }
        });
    });
    //when you screwed up, go back to default state :)
    //$state.go("gretel.home");
});
