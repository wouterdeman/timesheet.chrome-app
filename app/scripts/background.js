'use strict';

var manifest = chrome.runtime.getManifest();
var isAuthenticating = false;
var lastTokenTryOut = false;
var isInitializing = false;
var initialized = false;
var lastIdleState = 'active';

var saveToken = function saveToken(token) {
	chrome.storage.sync.set({
		'token': token
	}, function () {
		console.log('token set');
	});
};

var getLastToken = function getLastToken() {
	var dfd = new $.Deferred();

	chrome.storage.sync.get('token', function (result) {
		dfd.resolve(result.token);
	});

	return dfd;
};

var getOrCreateClientHash = function getOrCreateClientHash() {
	var dfd = new $.Deferred();

	chrome.storage.local.get('clienthash', function (result) {
		if (!result.clienthash) {
			var newClientHash = CryptoJS.SHA256(new Date().toISOString()).toString();
			chrome.storage.local.set({
				'clienthash': newClientHash
			}, function () {
				console.log('client hash set');
			});
			dfd.resolve(newClientHash);
		} else {
			dfd.resolve(result.clienthash);
		}
	});

	return dfd;
};

var authenticateUser = function () {
	var dfd = new $.Deferred();

	var redirectUrl = 'https://' + chrome.runtime.id + '.chromiumapp.org/';

	var authUrl = 'https://accounts.google.com/o/oauth2/auth?' +
		'client_id=607292229862-b0na3ohf67isteoqtfpaoal9j3j3al3h.apps.googleusercontent.com&' +
		'response_type=code&' +
		'scope=openid%20email&' +
		'access_type=offline&' +
		'approval_prompt=force&' +
		'redirect_uri=' + redirectUrl;


	isAuthenticating = true;
	var options = {
		'interactive': true,
		'url': authUrl
	};
	chrome.identity.launchWebAuthFlow(options,
		function (responseUrl) {
			console.log('launchWebAuthFlow completed', chrome.runtime.lastError,
				redirectUrl);

			if (chrome.runtime.lastError) {
				dfd.resolve(new Error(chrome.runtime.lastError));
				return;
			}
			var querystring = responseUrl.substring(responseUrl.indexOf('?') + 1);
			var params = deparam(querystring);

			var tokenurl = 'https://accounts.google.com/o/oauth2/token';

			var data = {
				code: params.code,
				client_id: '607292229862-b0na3ohf67isteoqtfpaoal9j3j3al3h.apps.googleusercontent.com',
				client_secret: 'PfpT2sY3tLOlztx9J5FE2gdR',
				redirect_uri: redirectUrl,
				grant_type: 'authorization_code',
			};

			$.post(tokenurl, data).done(function (res) {
				var requestTokenUrl = 'http://timesheetservice.herokuapp.com/auth/token';
				//var requestTokenUrl = 'http://localhost:3000/auth/token';
				var tokenRequestData = {
					refreshtoken: res.refresh_token,
					provider: 'google'
				};

				$.post(requestTokenUrl, tokenRequestData).done(function (res) {
					console.table('POST SUCCES', res, data);
					isAuthenticating = false;
					saveToken(res);
					dfd.resolve(res);
				}).fail(function (a, b, c, d) {
					console.log('POST failed', a, b, c, d);
					dfd.fail();
				});
			}).fail(function (a, b, c, d) {
				console.log('POST failed', a, b, c, d);
				dfd.fail();
			});
		});

	return dfd;
};

var deparam = function (querystring) {
	// remove any preceding url and split
	querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
	var params = {},
		pair, d = decodeURIComponent,
		i;
	// march and parse
	for (i = querystring.length; i > 0;) {
		pair = querystring[--i].split('=');
		params[d(pair[0])] = d(pair[1]);
	}

	return params;
};

var getLocation = function () {
	var dfd = new $.Deferred();
	navigator.geolocation.getCurrentPosition(function (position) {
		dfd.resolve(position.coords);
	}, function (err) {
		dfd.reject(err);
		console.log('Error getting current position', err);
	});
	return dfd;
};

var postGeoLocation = function (deciceName, coords) {
	var dfd = new $.Deferred();
	getLastToken().then(function (token) {
		getOrCreateClientHash().then(function (clientToken) {
			var loc = [coords.latitude, coords.longitude];
			var url = 'http://timesheetservice.herokuapp.com/entry';
			//var url = 'http://localhost:3000/entry';
			var data = {
				objectdetails: {
					appversion: manifest.name + '-' + manifest.version,
					devicetype: 'Chrome',
					devicestate: lastIdleState,
					devicename: deciceName
				},
				objectid: clientToken,
				loc: loc,
				token: token
			};

			$.post(url, data).done(function (d) {
				activitylogging.logLocationShare();
				console.table('POST SUCCES', d, data);
			}).fail(function () {
				dfd.reject();
			});
		});
	}).fail(function () {
		dfd.reject();
	});

	return dfd;
};

var shouldSend = function (s) {
	var currentDate = new Date();
	var currentDay = currentDate.getDay();
	var currentHour = currentDate.getHours();
	if (currentDay > 0 && currentDay < 6) {
		if (!s.weekdays.track)
			return false;
		return s.weekdays.from <= currentHour && s.weekdays.to >= currentHour;
	}
	if (!s.weekend.track)
		return false;
	return s.weekend.from <= currentHour && s.weekend.to >= currentHour;
};

var run = function () {
	if (!initialized && !isAuthenticating) {
		init();
		return false;
	} else if (!isAuthenticating && initialized) {
		getLocation().then(function (coords) {
			chrome.storage.local.get("settings", function (settingsValue) {
				var send = shouldSend(settingsValue.settings);
				console.log("settings are ", settingsValue.settings, send);
				if (!send) {
					backgroundservice.stop();
					return;
				}

				chrome.storage.local.get("devicename", function (value) {
					var val = value["devicename"];
					if (!backgroundservice.available) {
						postGeoLocation(val, coords).fail(function () {
							init();
						});
					} else {
						getLastToken().then(function (token) {
							getOrCreateClientHash().then(function (clientToken) {
								var objectdetails = {
									appversion: manifest.name + '-' + manifest.version,
									devicetype: 'Chrome',
									devicestate: lastIdleState,
									devicename: deciceName
								};

								backgroundservice.start(objectdetails, token, clientToken);
							});

							locationDetection.detectlocationunknown(coords);
						});
					};
					return true;
				});
			});
		});
	}
}

var init = function () {
	if (!lastTokenTryOut) {
		getLastToken().then(function (token) {
			if (!token) {
				authenticateUser();
			}
			lastTokenTryOut = true;
			initialized = true;
		});
	} else {
		authenticateUser();
		initialized = true;
	}
};

/******************** ALARMS *********************/
// We make use of the alarms if can't make use of the background service (phonegap)
if (!backgroundservice.available) {
	var alarmKey = 'servicePostAlarm';
	//locally you can set this lower than 1 (eg: for debugging, set 0.1)
	var alarmInfo = {
		periodInMinutes: 5
	};
	var alarmCallbacks = {};
	alarmCallbacks[alarmKey] = run;

	chrome.alarms.create(alarmKey, alarmInfo);
	chrome.alarms.onAlarm.addListener(function (aInfo) {
		alarmCallbacks[aInfo.name]();
	});
}

/******************* IDLE STATE ******************/

chrome.idle.queryState(60, function (newState) {
	lastIdleState = newState;
});

var res = run();
if (!res) {
	run();
}