'use strict';

angular.module('timesheetApp')
    .controller('MenuController', function ($scope, $ionicSideMenuDelegate) {

        //based on http://codepen.io/anon/pen/fpCyl

        $scope.hideSidemenuBackButton = true;
        var topLevelMenuElems;
        var id = 0;
        var createMenuItem = function (name, icon, state) {
            return {
                id: ++id,
                name: name,
                icon: icon,
                state: state,
                taxons: []
            };
        };
        var createMenuItemWithChildren = function (name, icon) {
            return {
                id: ++id,
                name: name,
                icon: icon,
                taxons: [],
                addSubMenu: function (name, icon, state) {
                    this.taxons.push(createMenuItem(name, icon, state));
                    return this;
                }
            };
        };


        topLevelMenuElems = $scope.menuElems = [
            createMenuItem('Home', 'ion-home', 'gretel.home'),
            createMenuItem('Absences', 'ion-calendar', 'gretel.absences.list'),
            createMenuItem('Saldo', 'ion-clock', 'gretel.saldo'),
            createMenuItem('Location details', 'ion-location', 'gretel.locationdetails'),
            createMenuItem('Manage activities', 'ion-clipboard', 'gretel.manageactivities'),
            createMenuItem('Activity log', 'ion-stats-bars', 'gretel.activitylog'),
            createMenuItem('Timesheet', 'ion-android-note', 'gretel.timesheet'),
            createMenuItemWithChildren('Admin', 'ion-settings')
            .addSubMenu('Users', 'ion-person-stalker', 'gretel.users.list')
            .addSubMenu('Holidays', 'ion-plane', 'gretel.holidays.list')
            .addSubMenu('Absence rights', 'ion-key', 'gretel.absencerights.list')
            .addSubMenu('Absence management', 'ion-calendar', 'gretel.absencemanagement.list')
            .addSubMenu('Freeze', 'ion-locked', 'gretel.freeze')
            .addSubMenu('Error', 'ion-ios7-pulse-strong', 'gretel.error')
        ];

        var getByParentId = function (id) {
            for (var i in topLevelMenuElems) {
                if (topLevelMenuElems[i].id == id) {
                    return topLevelMenuElems[i].taxons;
                }
            }
        }

        $scope.toggleCategories = function () {
            $scope.sideMenuController.toggleLeft();
        };

        $scope.showSubcategories = function (category) {
            $scope.menuElems = getByParentId(category.id);
            $scope.hideSidemenuBackButton = false;
        };

        $scope.showTopLevelCategories = function () {
            $scope.menuElems = topLevelMenuElems;
            $scope.hideSidemenuBackButton = true;
        };
    });
