'use strict';

var activitylogging = {
    logLocationShare: function () {
        chrome.storage.local.get('activitylog', function (data) {
            data = (data.activitylog && JSON.parse(data.activitylog)) || [];
            data.push({
                time: new Date(),
                message: 'Location has been shared'
            });

            chrome.storage.local.set({
                'activitylog': JSON.stringify(data)
            });
        });
    }
};
