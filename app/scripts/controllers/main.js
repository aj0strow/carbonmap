'use strict';

var energyMap = energyMap || [];

energyMap.factory('buildingsFactory', function($http) {
  return {
    getBuildings: function(callback) {
      $http.get('/api/buildings/buildings.json').success(callback);
    }
  };
});

energyMap.controller('MainCtrl', ['$scope', 'buildingsFactory' ,function ($scope, buildingsFactory) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    buildingsFactory.getBuildings(function(results) {
	    $scope.buildings = results;
	  });
  }]);


 
