'use strict';

var chromeApp = {
    getLastToken: function getLastToken() {
        var dfd = new $.Deferred();

        chrome.storage.sync.get('token', function (result) {
            dfd.resolve(result.token);
        });

        return dfd;
    },
    saveToken: function saveToken(token) {
        chrome.storage.sync.set({
            'token': token
        }, function () {
            console.log('token set');
        });
    },
    getLocation: function getLocation() {
        var dfd = new $.Deferred();
        navigator.geolocation.getCurrentPosition(function (position) {
            dfd.resolve(position.coords);
        }, function (err) {
            dfd.reject(err);
            console.log('Error getting current position', err);
        });
        return dfd;
    },
    showMessage: function showMessage(title, message) {
        var deferred = $.Deferred();

        var options = {
            type: "basic",
            title: title,
            message: message,
            iconUrl: "images/icon-128.png"
        };
        chrome.notifications.create(title, options, function (notificationId) {});
        chrome.notifications.onClicked.addListener(function (notificationId) {
            console.log(notificationId);
            if (notificationId == title) {
                deferred.resolve();
            }
        });

        return deferred.promise();
    },
    getClientHash: function getClientHash() {
        var dfd = new $.Deferred();

        chrome.storage.local.get('clienthash', function (result) {
            dfd.resolve(result.clienthash);
        });

        return dfd;
    },
    getOrCreateClientHash: function getOrCreateClientHash() {
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
    },
    storeLocally: function storeLocally(key, data) {
        var dfd = new $.Deferred();

        chrome.storage.local.set({
            key: JSON.stringify(data)
        }, function () {
            console.log('localStorage set');
        });

        return dfd;
    },
    retrieveLocally: function retrieveLocally(key) {
        var dfd = new $.Deferred();

        chrome.storage.local.get(key, function (result) {
            dfd.resolve(JSON.parse(result[key]));
        });

        return dfd;
    },
    show: function show() {
        var mainWindow = chrome.app.window.get('main');
        if (mainWindow) {
            mainWindow.show();
            return;
        }
        startupApp();
    },
    getDeviceName: function getDeviceName() {
        var dfd = new $.Deferred();

        chrome.storage.local.get("devicename", function (value) {
            var val = value["devicename"];
            dfd.resolve(val);
        });

        return dfd;
    },
    deparam: function deparam(querystring) {
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
    },
    authenticateUser: function authenticateUser() {
        var dfd = new $.Deferred();

        var redirectUrl = 'https://' + chrome.runtime.id + '.chromiumapp.org/';

        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' +
            'client_id=607292229862-b0na3ohf67isteoqtfpaoal9j3j3al3h.apps.googleusercontent.com&' +
            'response_type=code&' +
            'scope=openid%20email&' +
            'access_type=offline&' +
            'approval_prompt=force&' +
            'redirect_uri=' + redirectUrl;

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
                var params = chromeApp.deparam(querystring);

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
                    var tokenRequestData = {
                        refreshtoken: res.refresh_token,
                        provider: 'google'
                    };

                    $.post(requestTokenUrl, tokenRequestData).done(function (res) {
                        console.table('POST SUCCES', res, data);
                        chromeApp.saveToken(res);
                        dfd.resolve(res);
                    }).fail(function (a, b, c, d) {
                        console.log('POST failed', a, b, c, d);
                        dfd.fail(a, b, c, d);
                    });
                }).fail(function (a, b, c, d) {
                    console.log('POST failed', a, b, c, d);
                    dfd.fail(a, b, c, d);
                });
            });

        return dfd;
    }
};