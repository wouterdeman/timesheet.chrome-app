'use strict';

angular.module('timesheetApp')
    .controller('ChangeZoneController', function ($scope, $http, $location) {
        $scope.updateZone = updateZone;
        activate();

        function activate() {
            chromeApp.getLastToken().then(function (token) {
                var getCustomerUrl = 'http://timesheetservice.herokuapp.com/customers/all';
                //var url = 'http://localhost:3000/customers/all';
                var getCustomerData = {
                    token: token
                };

                $http.post(getCustomerUrl, getCustomerData).success(function (customers) {
                    $scope.customers = customers;
                    if (customers.length > 0) {
                        $scope.customer = customers[0];
                    }
                });

                chromeApp.getLocation().then(function (coords) {
                    var loc = [coords.latitude, coords.longitude];
                    var getZoneUrl = 'http://timesheetservice.herokuapp.com/zones/current';
                    //var url = 'http://localhost:3000/zones/current';
                    var getZoneData = {
                        loc: loc,
                        token: token
                    };

                    $http.post(getZoneUrl, getZoneData).success(function (zone) {
                        $scope.name = zone.zoneDetails.name;
                        $scope.description = zone.zoneDetails.description;
                        $scope.zone = zone._id;

                        var activity = _.find(zone.activities, {
                            'active': true
                        });
                        var customer = _.find($scope.customers, {
                            '_id': activity.activity
                        });
                        $scope.customer = customer;
                    });

                    $scope.suggestedPlaces = [];

                    $http.get("https://api.foursquare.com/v2/venues/search?ll=" + coords.latitude + "," + coords.longitude + "&radius=100&client_id=2HZHOBIRKWM35J5VJFMJ4F2QBN4AAXY4DQMQTYM3XNDFWUMP&client_secret=D25ST0Q0V3QHHOTIY1Q3VUDONZ3NMJWEZF1D5VBGEPK5RVE1&v=20141001").success(function (data) {
                        if (data.meta && data.meta.code === 200) {
                            var places = _.map(data.response.venues, function (venue) {
                                var place = {
                                    name: venue.name + ' (FSQ)'
                                };

                                if (venue.location) {
                                    place.address = venue.location.address;
                                }

                                $scope.suggestedPlaces.push(place);
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
                                    address: result.vicinity
                                };

                                $scope.suggestedPlaces.push(place);

                                return place;
                            });
                        }
                    });
                });
            });
        };

        function updateZone(valid) {
            $scope.submitted = true;
            if (!valid) {
                return;
            }
            chromeApp.getLastToken().then(function (token) {
                chromeApp.getLocation().then(function (coords) {
                    var loc = [coords.latitude, coords.longitude];
                    var data = {
                        token: token,
                        loc: loc,
                        name: $scope.name,
                        description: $scope.description,
                        customer: $scope.customer._id,
                        zone: $scope.zone
                    };

                    var url = 'http://timesheetservice.herokuapp.com/zones/update';
                    //var url = 'http://localhost:3000/zones/update';
                    $http.post(url, data).success(function () {
                        $location.path("/");
                    });
                });
            });
        };
    });
