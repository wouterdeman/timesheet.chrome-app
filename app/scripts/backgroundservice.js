//
//
// after deviceready
//
//

var backgroundservice = {
    available: function () {
        var result = window.plugins && window.plugins.backgroundGeoLocation

        return result;
    },
    debug: true,
    start: function (objectdetails, token, clientToken, debug) {
        if (!backgroundservice.available()) {
            console.log('Backgroundservice not initialised, backgroundGeoLocation is not available (phonegap)');
            return;
        }

        backgroundservice.debug = debug;

        // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
        // in order to prompt the user for Location permission.
        window.navigator.geolocation.getCurrentPosition(function (location) {
            console.log('Location from Phonegap');
        });

        var bgGeo = window.plugins.backgroundGeoLocation;

        /**
         * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
         */
        var yourAjaxCallback = function (response) {
            ////
            // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
            //  and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            //
            //
            bgGeo.finish();
        };

        /**
         * This callback will be executed every time a geolocation is recorded in the background.
         */
        var callbackFn = function (location) {
            console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
            // Do your HTTP request here to POST location to your server.



            yourAjaxCallback.call(this);
        };

        var failureFn = function (error) {
            console.log('BackgroundGeoLocation error');
            alert('failure ' + error);
        }

        /*objectdetails: {
                    appversion: manifest.name + '-' + manifest.version,
                    devicetype: 'Chrome',
                    devicestate: lastIdleState,
                    devicename: deciceName
                },
                objectid: clientToken,
                loc: loc,
                token: token*/

        if (token) {
            backgroundservice.lastparams = { //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
                objectdetails: objectdetails,
                objectid: clientToken,
                token: token
            };
        }

        // BackgroundGeoLocation is highly configurable.
        bgGeo.configure(callbackFn, failureFn, {
            url: 'http://timesheetservice.herokuapp.com/entry', // <-- Android ONLY:  your server url to send locations to
            params: backgroundservice.lastparams,
            headers: { // <-- Android ONLY:  Optional HTTP headers sent to your configured #url when persisting locations
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 30,
            debug: debug, // <-- enable this hear sounds for background-geolocation life-cycle.
            notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
            notificationText: 'ENABLED' // <-- android only, customize the text of the notification
        });

        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        bgGeo.start();

        // If you wish to turn OFF background-tracking, call the #stop method.
        // bgGeo.stop()
    },
    stop: function () {
        if (!backgroundservice.available()) {
            console.log('Backgroundservice not initialised, backgroundGeoLocation is not available (phonegap)');
            return;
        }

        // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
        // in order to prompt the user for Location permission.
        window.navigator.geolocation.getCurrentPosition(function (location) {
            console.log('Location from Phonegap');
        });

        var bgGeo = window.plugins.backgroundGeoLocation;
        bgGeo.stop();
    }
}
