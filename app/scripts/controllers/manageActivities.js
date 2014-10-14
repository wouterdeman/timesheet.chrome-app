'use strict';

angular.module('timesheetApp')
    .controller('ManageActivitiesController', function ($scope, $http, $location, urls, $ionicModal, $ionicPopup, $ionicLoading, dateFilter) {
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var today = new Date();
        var year = today.getFullYear();
        var currentDevice = -1;

        $scope.years = [year - 1, year, year + 1];
        $scope.selectedYear = year;
        $scope.months = monthNames.map(function (i, e) {
            return {
                id: e,
                name: i
            };
        });
        $scope.selectedMonth = $scope.months[today.getMonth()];
        $scope.customers = [];
        $scope.trackedTimes = [];
        $scope.devices = [];
        $scope.selectedDevice;
        $scope.copydate;
        $scope.copycustomer;
        var selectedTrackedTime;

        $scope.trackedTimesForDevice = function () {
            var deviceId = $scope.selectedDevice;
            return _.filter($scope.trackedTimes, {
                device: deviceId
            });
        };

        //INIT
        chromeApp.getLastToken().then(function (token) {
            var getCustomerData = {
                token: token
            };

            $http.post(urls.customers.all, getCustomerData).success(function (customers) {
                console.log("customers", customers);
                $scope.customers = customers;
            });
        });
        chromeApp.getClientHash().then(function (hash) {
            currentDevice = hash;
        });

        //ACTIONS
        $scope.getTrackedTime = function () {
            chromeApp.getLastToken().then(function (token) {
                var getCustomerData = {
                    token: token,
                    month: $scope.selectedMonth.id,
                    year: $scope.selectedYear
                };

                $ionicLoading.show({
                    template: 'Loading...'
                });

                $http.post(urls.customers.trackedTimeAndCustomer, getCustomerData).success(function (trackedTime) {
                    console.log("trackedTime", trackedTime);
                    $ionicLoading.hide();
                    $scope.trackedTimes = _.forEach(trackedTime, function (tt) {
                        tt.date = new Date(tt.date);
                        tt.isWeekend = tt.date.getDay() % 6 == 0;
                        tt.formattedDate = dateFilter(tt.date, 'dd');

                        var cd = 24 * 60 * 60 * 1000,
                            ch = 60 * 60 * 1000,
                            d = Math.floor(tt.duration / cd),
                            h = '0' + Math.floor((tt.duration - d * cd) / ch),
                            m = '0' + Math.round((tt.duration - d * cd - h * ch) / 60000);
                        tt.formattedDuration = [h.substr(-2), m.substr(-2)].join(':');
                        if (tt.suggestedCustomer) {
                            tt.customer = tt.suggestedCustomer;
                        }
                    });;

                    var grouped = _.groupBy(trackedTime, 'device');
                    var deviceIds = _.keys(grouped);
                    var devices = _.map(deviceIds, function (deviceId) {
                        var name = _.first(grouped[deviceId]).devicedetails.devicetype;
                        var deciveName = _.last(grouped[deviceId]).devicedetails.devicename;
                        if (deciveName) {
                            name = name + " - " + deciveName;
                        }
                        if (deviceId === currentDevice)
                            name += " (huidig)";
                        return {
                            id: deviceId,
                            name: name
                        };
                    });

                    $scope.devices = devices;
                    if (!$scope.selectedDevice) {
                        $scope.selectedDevice = currentDevice;
                    }
                });
            });
        };


        $scope.saveActivity = function (trackedTimeForDevice) {
            var date = trackedTimeForDevice.date;
            chromeApp.getLastToken().then(function (token) {
                var updateCustomerData = {
                    token: token,
                    day: date.getDate(),
                    month: date.getMonth(),
                    year: date.getFullYear(),
                    device: $scope.selectedDevice,
                    customer: trackedTimeForDevice.customer
                };

                $http.post(urls.customers.updateCustomerForTrackedTime, updateCustomerData).success(function (response) {
                    chromeApp.showMessage('Activity saved', 'Activity details saved.');
                    $scope.getTrackedTime();
                });
            });
        }

        $ionicModal.fromTemplateUrl('copy-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.copymodal = modal;
        });

        $scope.closeCopyModal = function () {
            $scope.copymodal.hide();
        };

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.copymodal.remove();
        });

        $scope.copyActivity = function (trackedTime) {
            selectedTrackedTime = trackedTime;
            var date = selectedTrackedTime.date;
            var month = date.getMonth() + 1;
            $scope.copydate = date.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
            $scope.copymodal.show();

        }

        $scope.saveCopy = function () {
            var date = new Date($scope.copydate);
            chromeApp.getLastToken().then(function (token) {
                var copyData = {
                    token: token,
                    day: date.getDate(),
                    month: date.getMonth(),
                    year: date.getFullYear(),
                    customer: $scope.copycustomer._id,
                    reference: selectedTrackedTime.reference
                };

                $http.post(urls.customers.copyReferencedTrackedTime, copyData).success(function (response) {
                    $scope.copymodal.hide();
                    chromeApp.showMessage('Copy', 'New copy saved.');
                    $scope.getTrackedTime();
                });
            });
        }

        $scope.showDeleteConfirm = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this record?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    chromeApp.getLastToken().then(function (token) {
                        var deleteData = {
                            token: token,
                            reference: selectedTrackedTime.reference
                        };

                        $http.post(urls.customers.deleteReferencedTrackedTime, deleteData).success(function (response) {
                            chromeApp.showMessage('Delete', 'Item deleted.');
                            $scope.getTrackedTime();
                        });
                    });
                }
            });
        };

        $scope.showDeleteDialog = function (trackedTime) {
            selectedTrackedTime = trackedTime;
            $scope.showDeleteConfirm();
        };
    });