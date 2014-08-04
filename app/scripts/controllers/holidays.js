'use strict';

angular.module('timesheetApp')

    .service("HolidayService", ['$http', '$q', function(http, q) {

        var testData=[
            {name:"Onze Lieve Heer Hemelvaart", date: new Date(2014,8,15), id:1},
            {name:"Wapenstilstand", date: new Date(2014,1,11), id:2}
        ];
      return {
        getAll: function() {
          var address = q.defer();
          setTimeout(function(){
             address.resolve(_.clone(testData));
         },10);
          
          /*
          http.get("/user/" + user.id + "/address").then(function(data) {
            address.resolve(data);
          }, function(err) {
            address.reject(err);
          });*/
          return address.promise;
        },
        getById: function(id) {
          var user = q.defer();
          setTimeout(function(){
             user.resolve(_.find(_.clone(testData),{id:id}));
         },10);
          /*
          http.get("/user/address").then(function(data) {
            user.resolve(data);
          }, function(err) {
            user.reject(err);
          });*/
          return user.promise;
        }
      }
    }])
    .controller('HolidaysController', function ($scope, $http, $location, $ionicLoading, HolidayService) {
        //todo: refactor loading stuff in decorator
        $ionicLoading.show({
          template: 'Loading...'
        });
        HolidayService.getAll().then(function(d){
            $scope.holidays= d;
            $ionicLoading.hide();
        })

        $scope.remove=function(item){
            var index = $scope.holidays.indexOf(item)
            $scope.holidays.splice(index, 1);     
        };



    })
    .controller('HolidaysDetailController', function ($stateParams, $scope, HolidayService) {
        var id=parseInt($stateParams.id,10);

        HolidayService.getById(id).then(function(d){
             $scope.holiday=d;
        })
       





    });
