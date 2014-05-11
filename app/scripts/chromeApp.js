'use strict';

var chromeApp = {
    getLastToken: function getLastToken() {
        var dfd = new $.Deferred();

        chrome.storage.sync.get('token', function (result) {
            dfd.resolve(result.token);
        });

        return dfd;
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
    }
};