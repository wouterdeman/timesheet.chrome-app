'use strict';

angular.module('timesheetApp')
    .controller('PlacesController', function ($scope, $http, $location, $ionicModal) {
        $scope.showPlace = showPlace;
        $scope.doRefresh = doRefresh;
        activate();

        function activate() {


            $ionicModal.fromTemplateUrl('gretel/places/place.modal.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });

            doRefresh();
        }

        function doRefresh() {
            chromeApp.getLocation().then(function (coords) {
                $scope.places = [];

                $http.get("https://api.foursquare.com/v2/venues/search?ll=" + coords.latitude + "," + coords.longitude + "&radius=100&client_id=2HZHOBIRKWM35J5VJFMJ4F2QBN4AAXY4DQMQTYM3XNDFWUMP&client_secret=D25ST0Q0V3QHHOTIY1Q3VUDONZ3NMJWEZF1D5VBGEPK5RVE1&v=20141001").success(function (data) {
                    if (data.meta && data.meta.code === 200) {
                        var places = _.map(data.response.venues, function (venue) {
                            var place = {
                                name: venue.name + ' (FSQ)',
                                originalname: venue.name,
                                categories: [],
                                url: venue.url,
                                contact: venue.contact
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

                            _.forEach(venue.categories, function (category) {
                                place.categories.push(category.name);
                            });

                            $scope.places.push(place);
                            return place;
                        });
                        console.log(data);
                    }
                });

                $http.get("https://maps.googleapis.com/maps/api/place/search/json?location=" + coords.latitude + "," + coords.longitude + "&radius=100&sensor=true&key=AIzaSyBrxt1UXQXNNfpPAkBJBLKeUj9XN2tZXlo").success(function (data) {
                    if (data.status === "OK") {
                        var places = _.map(data.results, function (result) {
                            var place = {
                                name: result.name + ' (G)',
                                originalname: result.name,
                                address: result.vicinity,
                                icon: result.icon,
                                categories: result.types,
                                googledetail: result.place_id
                            };

                            $scope.places.push(place);

                            return place;
                        });
                        console.log(data);
                    }
                });
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        function showPlace(place) {
            $scope.place = place;

            if (place.googledetail) {
                $http.get("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + place.googledetail + "&key=AIzaSyBrxt1UXQXNNfpPAkBJBLKeUj9XN2tZXlo").success(function (data) {
                    if (data.status === "OK") {
                        place.url = data.result.website || data.result.url;
                        place.contact = {
                            formattedPhone: data.result.international_phone_number,
                            phone: data.result.international_phone_number
                        };
                    }
                });
            }

            $scope.modal.show();
        };
    });
