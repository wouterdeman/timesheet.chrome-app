'use strict';

angular.module('timesheetApp')
    .controller('PlacesController', function ($scope, $http, $location) {
        activate();

        function activate() {
            chromeApp.getLocation().then(function (coords) {
                $scope.places = [];

                $http.get("https://api.foursquare.com/v2/venues/search?ll=" + coords.latitude + "," + coords.longitude + "&radius=100&client_id=2HZHOBIRKWM35J5VJFMJ4F2QBN4AAXY4DQMQTYM3XNDFWUMP&client_secret=D25ST0Q0V3QHHOTIY1Q3VUDONZ3NMJWEZF1D5VBGEPK5RVE1&v=20141001").success(function (data) {
                    if (data.meta && data.meta.code === 200) {
                        var places = _.map(data.response.venues, function (venue) {
                            var place = {
                                name: venue.name + ' (FSQ)'
                            };

                            if (venue.location) {
                                place.address = venue.location.address;
                            }

                            if (venue.categories && venue.categories.length > 0) {
                                var category = venue.categories[0];
                                if (category.icon && category.icon.prefix) {
                                    place.icon = category.icon.prefix + 'bg_32' + category.icon.suffix;

                                    var xhr = new XMLHttpRequest();
                                    xhr.open('GET', '' + place.icon, true);
                                    xhr.responseType = 'blob';
                                    xhr.onload = function (e) {
                                        var img = document.createElement('img');
                                        img.src = window.URL.createObjectURL(this.response);
                                        place.iconimg = img;
                                    };

                                    xhr.send();
                                }
                            }

                            $scope.places.push(place);
                            return place;
                        });
                    }
                    console.log(data);
                });

                $http.get("https://maps.googleapis.com/maps/api/place/search/json?location=" + coords.latitude + "," + coords.longitude + "&radius=100&sensor=true&key=AIzaSyBrxt1UXQXNNfpPAkBJBLKeUj9XN2tZXlo").success(function (data) {
                    if (data.status === "OK") {
                        var places = _.map(data.results, function (result) {
                            var place = {
                                name: result.name + ' (G)',
                                address: result.vicinity,
                                icon: result.icon
                            };

                            $scope.places.push(place);

                            return place;
                        });
                    }
                    console.log(data);
                });
            });
        }
    });
