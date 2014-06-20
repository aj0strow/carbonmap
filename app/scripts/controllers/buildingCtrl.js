'use strict';

angular.module('energyMap').directive('horizontal', ['$stateParams',
    function($stateParams) {

        function link() {

            var jQuery = jQuery || [];

            jQuery(document).ready(function($) {

                $('#building .mapMarker').remove();

                $('*[data-building-id="' + $stateParams.id + '"]').clone().css({
                    'top': 0,
                    'left': 0
                  }).css('z-index', '2').appendTo('#building');

              });

          }

        return {
            priority: 500,
            link: link,
            restrict: 'E'
          };
      }
])

angular.module('energyMap').directive('embuilding', ['$stateParams',
    function($stateParams) {

        function link() {

            var jQuery = jQuery || [];

            jQuery(document).ready(function($) {

                $('#building .mapMarker').remove();

                $('*[data-building-id="' + $stateParams.id + '"]').clone().css({
                    'top': 0,
                    'left': 0
                  }).css('z-index', '2').appendTo('#building');

                   $('*[data-building-id="' + $stateParams.id + '"]').closest('.building').addClass('blue');

              });

          }

        return {
            priority: 500,
            link: link,
            restrict: 'E'
          };
      }
]).controller('BuildingCtrl', [
    '$scope',
    'buildingFactory',
    'buildingColourFactory',
    '_',
    '$stateParams',
    function($scope, buildingFactory, buildingColourFactory, _, $stateParams) {

        $scope.abs = Math.abs;

        $scope.building = {};

        buildingFactory.getBuilding($stateParams.id, function(results) {

            $scope.building = results;
            $scope.building.colour = buildingColourFactory.getBuildingColour(results.savings.lastMonth);

          });

      }
  ]);