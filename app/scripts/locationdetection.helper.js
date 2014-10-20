var locationDetection = {
    detectlocationunknown: function (loc) {
        var storeNew = function (loc) {            
            chrome.storage.local.set({
                'reminderCount': JSON.stringify({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    startDate: new Date()
                })
            });
        }

        var storeExisting = function (reminderCount) {            
            chrome.storage.local.set({
                'reminderCount': JSON.stringify(reminderCount)
            });
        }

        chrome.storage.local.get('reminderCount', function (data) {
            data = (data['reminderCount'] && JSON.parse(data['reminderCount'])) || '';
            if (!data) {
                storeNew(loc);
                return;
            }

            var distanceInMeters = geolib.getDistance({
                latitude: loc.latitude,
                longitude: loc.longitude
            }, {
                latitude: data.latitude,
                longitude: data.longitude
            });
            var minutespast = moment(new Date()).diff(moment(data.startDate), 'minutes')
            if (distanceInMeters > 30) {
                storeNew(loc);
                return;
            }
            if (minutespast < 20) {
                storeExisting(data);
                return;
            }

            chromeApp.getLastToken().then(function (token) {
                var locarray = [loc.latitude, loc.longitude];
                var url = 'http://timesheetservice.herokuapp.com/zones/current';
                //var url = 'http://localhost:3000/zones/current';
                var data = {
                    loc: locarray,
                    token: token
                };

                $.post(url, data).done(function (zone) {
                    console.log('zone check');
                    if (!zone) {
                        chromeApp.showMessage('Unregistered zone found', 'Click here to register your current location as a zone if it means something to you (e.g home, workplace, etc...).').then(function () {
                            chromeApp.show();
                            storeNew(loc);
                        });
                    }
                }).fail(function (a, b, c, d) {
                    console.log('POST failed', a, b, c, d);
                });
            });
        });
    }
}