angular.module('timesheetApp').run(function ($rootScope, $state, $http) {

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
      if (!valid || valid === "false") {
        chromeApp.authenticateUser().then(function (token) {
          $http.defaults.headers.common.token = token;
          startupBackgroundService(token);
        }).fail(function (a, b, c, d) {
          $state.go("gretel.error", {
            message: "Unable to authenticateUser." + a + b + c + d
          });
        });
      } else {
        startupBackgroundService(token);
      }
    }).error(function (data, status, headers, config) {
      $state.go("gretel.error", {
        message: "Unable to verify. Service is not available. Status " + status
      });
    });
  });



});