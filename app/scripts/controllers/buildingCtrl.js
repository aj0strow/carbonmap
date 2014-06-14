'use strict';

angular.module('energyMap')
  .controller('BuildingCtrl', [
  '$scope',
  'buildingFactory',
  'buildingColourFactory',
  '_',
  '$stateParams',
  '$http',
  '$timeout',
  function ($scope, buildingFactory, buildingColourFactory, _, $stateParams, $http, $timeout) {

    $scope.abs = Math.abs;

    $scope.building = {};
    $scope.hello = 'hello';

    buildingFactory.getBuilding($stateParams.id, function(results) {
      
	      $scope.building = results;
	      $scope.building.colour = buildingColourFactory.getBuildingColour(results.savings.lastMonth);

	  });

  }]).directive('embuilding', ['$stateParams', function($stateParams) {

    function link(scope, element, attrs) {
      
    	jQuery(document).ready(function($){

    		$('#building .mapMarker').remove();

       
    		$("*[data-building-id='"+$stateParams.id+"']").clone().css({
                              'top':0,
                              'left':0
            }).css('z-index','2').appendTo('#building');

    	});

    }

    return {
   		priority:500,
      link: link,
      restrict: 'E'
    };
  }]);