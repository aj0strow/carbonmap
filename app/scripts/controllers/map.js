'use strict';

var energyMap = energyMap || [];
var google = google || [];
var jQuery = jQuery || [];
var $ = jQuery || [];
energyMap.factory('buildingsFactory', ['$http', function ($http) {
    return {
        getBuildings: function (callback) {
            $http({method:'GET', url:'http://carbonsavings.herokuapp.com/buildings'})
            .success(callback)
            .error(function(data, status, headers, config) {
                console.log('data') });
            }
    };
}])
    .factory('buildingFactory', ['$http', function ($http) {
        return {
            getBuilding: function (id, callback) {
                $http.get('http://carbonsavings.herokuapp.com/building/' + id ).success(callback);
            }
        };
    }])
    .factory('buildingColourFactory', function () {
        return {
            getBuildingColour: function (num) {
                if (num < 0) {
                    return 'red';
                }
                if (num === 0) {
                    return 'gray';
                }
                if (num > 0) {
                    return 'green';
                }
            }
        };
    }).filter('intCurrency', ['$filter', '$locale',
    function (filter, locale) {
        var currencyFilter = filter('currency');
        var formats = locale.NUMBER_FORMATS;
        return function (amount, currencySymbol) {
            amount = amount ? (amount * 1).toFixed(2) : 0.00;
            var value = currencyFilter(amount, currencySymbol);
            // split into parts
            var parts = value.split(formats.DECIMAL_SEP);
            var dollar = parts[0];
            var cents = parts[1] || '00';
            cents = cents.substring(0, 2) === '00' ? cents.substring(2) : '.' + cents; // remove "00" cent amount
            return dollar + cents;
        };
    }
    ]).run(['$rootScope',
    '$state',
    '$stateParams',
    function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
    ]).controller('MainCtrl', [
    '$scope',
    'buildingsFactory',
    'buildingFactory',
    '_',
    '$http',
    '$timeout',
    '$location',
    '$state',
    'leafletEvents',
    function ($scope, buildingsFactory, buildingFactory, _, $http, $timeout, $location, $state, leafletEvents) {

        $scope.abs = Math.abs;

        $scope.buildings = {};
        $scope.savingsOverview = {};

        buildingsFactory.getBuildings(function (results) {

            window.buildings = results.buildings;

            _.map(results.buildings, function(building){ 

                var icon = {
                    type: 'div',
                    iconSize: [1, 1]
                }

                building.lat = building.coordinates.latitude;
                building.lng = building.coordinates.longitude;

                building.icon = icon;

                var widthFactor = Math.abs(building.savings.lastMonth) * 4 + 38 > 70 ? 70 : Math.abs(building.savings.lastMonth) * 4 + 38; 

                if(building.savings.lastMonth > 0) {
                    building.icon.html = '<div style="left:-'+widthFactor/2+'px; width:'+widthFactor+1+'px; height:'+widthFactor*1.2832+'px" data-building-id="'+building.id+'" ><img src="images/markerGreen.png" width="'+widthFactor+'"  height="auto" /><div class="label" style="width:'+widthFactor+'px; height:'+widthFactor*1.2832+'px"><h6 style="font-size:'+widthFactor/3+'px">'+Math.abs(building.savings.lastMonth)+'</h6></div></div>';
                }
                if (building.savings.lastMonth < 0) {
                    building.icon.html = '<div style="left:-'+widthFactor/2+'px; width:'+widthFactor+1+'px; height:'+widthFactor*1.2832+'px" data-building-id="'+building.id+'" ><div class="label" style="width:'+widthFactor+'px; height:'+widthFactor*1.2832+'px"><h6 style="font-size:'+widthFactor/3+'px">'+Math.abs(building.savings.lastMonth)+'</h6></div></div><div style="left:-'+widthFactor/2+'px; width:'+widthFactor+1+'px; height:'+widthFactor*1.2832+'px" data-building-id="'+building.id+'" ><img src="images/markerRed.png" width="'+widthFactor+'"  height="auto" /><div class="label" style="width:'+widthFactor+'px; height:'+widthFactor*1.2832+'px"><h6 style="font-size:'+widthFactor/3+'px">'+Math.abs(building.savings.lastMonth)+'</h6></div></div>';
                }
                if (building.savings.lastMonth == 0) {
                    building.icon.html = '<div style="left:-'+widthFactor/2+'px; width:'+widthFactor+1+'px; height:'+widthFactor*1.2832+'px" data-building-id="'+building.id+'" ><img src="images/markerGray.png" width="20" height="auto" /></div>';
                } 

                return building;
             });

            $scope.markers = results.buildings;
            $scope.topBuildings = results.buildings;

            $scope.topBuildings = _.sortBy($scope.topBuildings, function(building) { return -building.savings.lastMonth })

            _.each($scope.topBuildings, function(building){

                buildingFactory.getBuilding(building.id, function (result) {

                building.name = result.name;
                building.imageThumbnail =  result.imageThumbnail

                })

            });

            $scope.savingsOverview = results.savings

        });

       $scope.defaults =  {
            maxZoom: 18,
            path: {
                weight: 10,
                color: '#800000',
                opacity: 1
            },
        };
       $scope.center = {
            lat: 44.231,
            lng: -76.499,
            zoom:16
        };

        $scope.events = {
            map: {
                enable: ['drag', 'click', 'touchEnd'],
                logic: 'emit'
            },
            markers: {
                enable: ['click', 'touchEnd'],
                logic: 'emit'
            }
        }

        $scope.$on('leafletDirectiveMap.zoomstart ', function(event){
            $state.go('map');
        });

        $scope.$on('leafletDirectiveMap.drag ', function(event){
            $state.go('map');
        });

        $scope.$on('leafletDirectiveMap.click', function(event){
            $state.go('map');
        });

        $scope.$on('leafletDirectiveMarker.click', function(event, args){
            $state.go('map.building', { id: args.leafletEvent.target.options.id });

            if(args.leafletEvent.originalEvent.screenY + 300 > window.innerHeight) {
              var showOnTop = true;
            } else {
              var showOnTop = false;
            }

            if (showOnTop) {
                $('#building').css('top', args.leafletEvent.originalEvent.pageY - 50 + 'px');
            } else {
                $('#building').css('top', args.leafletEvent.originalEvent.pageY + 100 + 'px');
            }
            
            $('#building').css('left', args.leafletEvent.originalEvent.pageX + 'px');

            $scope.overTarget = true;

        });

        var layers = {

            baselayers: {
                cloudmade2: {
                    name: 'Cloudmade Tourist',
                    type: 'xyz',
                    url: "http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[@80],$fff[hsl-saturation@80],$bab8ab[hsl-color])[hsl-saturation]/{z}/{x}/{y}.png",
                }
            }
        }

        $scope.layers = layers;

        var tilesDict = {
            openstreetmap: {
                
                url: "https://api.tiles.mapbox.com/v4/base.live-satellite+0.16x0.16;0.00x0.00;0.50x1.00;0.00x1.00,base.mapbox-streets+scale-1_water-0.57x0.57;0.69x0.69;0.67x0.67;0.00x1.00_streets-0.00x1.00;0.00x1.00;1.00x0.00;0.00x0.00_landuse-0.00x1.00;0.00x1.00;0.00x1.00;0.00x0.00_buildings-0.00x1.00;0.00x1.00;0.00x1.00;0.00x0.00/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q&update=i0uil",
                options: {
                    "attribution":  [
                'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ',
                'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ',
                'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, ',
                'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
            ].join("")
                }
            }
        }

        $scope.tiles = tilesDict.openstreetmap;

    }
]);