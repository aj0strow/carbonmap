'use strict';

var energyMap = energyMap || [];

energyMap.factory('buildingsFactory', function($http) {
  return {
    getBuildings: function(callback) {
      $http.get('/api/buildings/buildings.json').success(callback);
    }
  };
});

energyMap.controller('MainCtrl', ['$scope', 'buildingsFactory', '_', function ($scope, buildingsFactory, _) {

    console.log(_);

    $scope.buildings = {};


    buildingsFactory.getBuildings(function(results) {
	    
      results = _.sortBy(results, function(result) {
        //element will be each array, so we just return a date from first element in it
        return result.savings.lastMonth;
      });

      console.log(results);
      $scope.buildings = results;

	  });

  }]);


 
