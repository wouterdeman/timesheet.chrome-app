'use strict';

var manifest = chrome.runtime.getManifest();
var isAuthenticating = false;
var lastTokenTryOut = false;
var isInitializing = false;
var initialized = false;

var saveToken = function saveToken(token) {
	chrome.storage.sync.set({
		'token': token
	}, function() {
		console.log("token set");
	});
}

var getLastToken = function getLastToken() {
	var dfd = new $.Deferred();

	chrome.storage.sync.get('token', function(result) {
		dfd.resolve(result.token);
	});

	return dfd;
};

var authenticateUser = function() {
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
		function(responseUrl) {
			console.log('launchWebAuthFlow completed', chrome.runtime.lastError,
				redirectUrl);

			if (chrome.runtime.lastError) {
				dfd.resolve(new Error(chrome.runtime.lastError));
				return;
			}
			var querystring = responseUrl.substring(responseUrl.indexOf("?") + 1);
			var params = deparam(querystring);

			var tokenurl = "https://accounts.google.com/o/oauth2/token";

			var data = {
				code: params.code,
				client_id: "607292229862-b0na3ohf67isteoqtfpaoal9j3j3al3h.apps.googleusercontent.com",
				client_secret: "PfpT2sY3tLOlztx9J5FE2gdR",
				redirect_uri: redirectUrl,
				grant_type: "authorization_code",
			};

			$.post(tokenurl, data).done(function(res) {
				var requestTokenUrl = "http://timesheetservice.herokuapp.com/auth/token"; // "http://localhost:3000/auth/token";
				var tokenRequestData = {					
					refreshtoken: res.refresh_token,
					provider: "google"
				};

				$.post(requestTokenUrl, tokenRequestData).done(function(res) {
					console.table("POST SUCCES", res, data);
					isAuthenticating = false;
					saveToken(res);
					dfd.resolve(res);
				}).fail(function(a, b, c, d) {
					console.log("POST failed", a, b, c, d);
					dfd.fail();
				});
			}).fail(function(a, b, c, d) {
				console.log("POST failed", a, b, c, d);
				dfd.fail();
			});
		});

	return dfd;
};

var deparam = function(querystring) {
	// remove any preceding url and split
	querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
	var params = {}, pair, d = decodeURIComponent,
		i;
	// march and parse
	for (i = querystring.length; i > 0;) {
		pair = querystring[--i].split('=');
		params[d(pair[0])] = d(pair[1]);
	}

	return params;
}

var getLocation = function() {
	var dfd = new $.Deferred();
	navigator.geolocation.getCurrentPosition(function(position) {
		dfd.resolve(position.coords);
	}, function(err) {
		dfd.reject(err);
		console.log("Error getting current position", err);
	});
	return dfd;
}

var postGeoLocation = function() {
	var dfd = new $.Deferred();

	getLastToken().then(function(token) {
		getLocation().then(function(coords) {
			var loc = [coords.latitude, coords.longitude];
			var url = "http://timesheetservice.herokuapp.com/entry";
			//var url="http://localhost:3000/entry";
			var data = {
				type: 'locationinfo',
				userinfo: {
					deviceid: manifest.name + "-" + manifest.version,
					devicetype: 'Chrome',
				},
				loc: loc,
				token: token
			};

			$.post(url, data).done(function(d) {
				console.table("POST SUCCES", d, data);
			}).fail(function(a, b, c, d) {
				dfd.reject();
			});
		});

	}).fail(function() {
		dfd.reject();
	});

	return dfd;
};

var run = function() {
	return;
	if (!initialized && !isAuthenticating) {
		init();
		return false;
	} else if(!isAuthenticating && initialized) {
		postGeoLocation().fail(function() {
			init();
		});		
	}
	return true;	
};

var init = function() {
	if(!lastTokenTryOut) {
		getLastToken().then(function(token) {
			if(!token) {
				authenticateUser();
			}
			lastTokenTryOut = true;
			initialized = true;
		});
	} else {
		authenticateUser();
		initialized = true;
	}
}

var alarmKey = "servicePostAlarm";
//locally you can set this lower than 1 (eg: for debugging, set 0.1)
var alarmInfo = {
	periodInMinutes: 5
};
var alarmCallbacks = {};
alarmCallbacks[alarmKey] = run;

var alarm = chrome.alarms.create(alarmKey, alarmInfo);
chrome.alarms.onAlarm.addListener(function(aInfo) {
	alarmCallbacks[aInfo.name]();
});

var res = run();
if(!res) {
	run();
}