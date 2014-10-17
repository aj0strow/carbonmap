'use strict';

window.typekitLoad('gci4xol');
var energyMap = angular.module('energyMap', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'underscore',
    'ngFitText',
    'ui.router',
    'slugifier',
    'leaflet-directive',
  ]).config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    
    $locationProvider.html5Mode(true);
    
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('map', {
      url: '/',
      views: {
        'map': {
            templateUrl: 'partials/map.html',
            controller: 'MainCtrl'
          }
        }
      });

      $stateProvider.state('map.home', {
          url: '#home',
          controller: function($scope, $location){
            $location.hash('home')
          }
      });

      $stateProvider.state('map.view', {
          url: '#mapView',
          controller: function($scope, $location){
            window.location.hash = '#mapView';
          }
      });

    $stateProvider.state('map.building', {
        views: {
          'building': {
              templateUrl: 'partials/building.html',
              controller: 'BuildingCtrl'
            }
          },
          url: 'building/:id'
        });

    $stateProvider.state('map.whatIsCarbonSavings', {
        views: {
          'whatIsCarbonSavings': {
              templateUrl: 'partials/whatIsCarbonSavings.html'
            }
          },
          url: 'what-is-carbon-savings',
          controller: function($scope){
              jQuery('.navbar').removeClass('in');
              console.log(angular.element('.navbar'));
              console.log('test');
          }
        });

    $stateProvider.state('map.about', {
        views: {
          'about': {
              templateUrl: 'partials/about.html',
            }
          },
          url: 'about',
          controller: function($scope){
              jQuery('.navbar').removeClass('in');
                            console.log('test');
          }
        });
  });
'use strict';

var energyMap = energyMap || [];
var google = google || [];
var jQuery = jQuery || [];
var $ = jQuery || [];
energyMap.factory('buildingsFactory', ['$http', function ($http) {
    return {
        getBuildings: function (callback) {
            $http({method:'GET', url:'http://carbonsavings.herokuapp.com/buildings'})
            // $http({method:'GET', url:'api/buildings/buildings.json'})
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
/*
            buildingFactory.getBuilding($stateParams.id, function(results) {

            $scope.building.colour = buildingColourFactory.getBuildingColour(results.savings.lastMonth);

            });
*/


            
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
                logic: 'emit',
                disable: ['zoomlevelschange']
            },
            markers: {
                enable: ['click', 'touchEnd'],
                logic: 'emit'
            }
        }

        console.log(leafletEvents.getAvailableMarkerEvents());

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

            console.log(args);
 
            /*
            ($location.path() === '') {
                return;
            }
            */

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

            //$(this).toggleClass('blue');
            //$(this).clone().appendTo('#building');

            // $location.path($(this).find('a').attr('ui-sref'))
            $scope.overTarget = true;



        });

        var layers = {

            baselayers: {
                cloudmade2: {
                    name: 'Cloudmade Tourist',
                    type: 'xyz',
                    url: "http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$000[@40],$fff[hsl-saturation@40])[hsl-saturation@90]/{z}/{x}/{y}.png",
                }
            }
        }

        $scope.layers = layers;

        var tilesDict = {
            openstreetmap: {
                
                url: "https://api.tiles.mapbox.com/v4/base.live-satellite+0.05x1.00;0.00x0.30;0.00x0.20;0.00x1.00,base.mapbox-streets+bg-73b5e6_scale-1_water-0.54x0.54;0.60x0.60;0.43x0.43;0.00x1.00_streets-0.57x0.57;0.00x0.40;1.00x0.28;0.00x0.00_landuse-0.55x0.55;0.70x0.70;0.38x0.78;0.00x1.00_buildings-0.56x0.56;0.70x0.70;0.43x0.83;0.00x1.00/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q&update=i0uil",
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

/*
            // GOOGLE MAP //
            $scope.map = {
                center: {
                    latitude: 44.231,
                    longitude: -76.495
                },
                zoom: 16,
                options: {
                    overviewMapControl: false,
                    scaleControl: true,
                    scrollwheel: false,
                    styles: mapStyles,
                    zoomControl: true,
                },
                mapTypeId: layer,
                mapTypeControlOptions: {
                    mapTypeIds: [layer]
                },
                draggable: true,
                events: {
                    tilesloaded: function (map) {
                        $scope.$apply(function () {

                            window.map = map;
                            $scope.mapInstance = map;


                            $scope.mapInstance.setMapTypeId('watercolor');
                            $scope.mapInstance.mapTypes.set('watercolor', new google.maps.StamenMapType('watercolor'));

                            /*

                            function CustomMarker(latlng, themap, className, buildingId, percent, content) {
                                this.latlng_ = latlng;
                                this.classAttr = className;
                                this.percent = percent;
                                this.content = content;
                                this.id = buildingId;
                                this.setMap(themap);
                            }

                            CustomMarker.prototype = new google.maps.OverlayView();

                            CustomMarker.prototype.draw = function () {
                                var div = this.div_;
                                if (!div) {
                                    div = this.div_ = document.createElement('DIV');

                                    var createColor = function (num) {
                                        if (num < 0) {
                                          return 'red';
                                        }
                                        if (num === 0) {
                                          return 'gray';
                                        }
                                        if (num > 0) {
                                          return 'green';
                                        }
                                    };

                                    div.className = this.classAttr + ' ' + createColor(this.percent);
                                    div.content = this.content;
                                    var fontSizeBound = Math.abs(this.percent) * 4 + 28 > 50 ? 50 : Math.abs(this.percent) * 4 + 28;
                                    fontSizeBound = fontSizeBound < 10 ? 10 : fontSizeBound;
                                    div.style.fontSize = fontSizeBound + 'px';
                                    div.setAttribute('data-percent', this.percent);
                                    div.setAttribute('data-building-id', this.id);
                                    var panes = this.getPanes();
                                    panes.overlayMouseTarget.appendChild(div);
                                    var that = this;
                                    google.maps.event.addDomListener(div, 'mousedown', function () {
                                        google.maps.event.trigger(that, 'mousedown'); // from [http://stackoverflow.com/questions/3361823/make-custom-overlay-clickable-google-maps-api-v3]

                                    });

                                    $('.mapMarker').each(function (i, el) {

                                        $(el).empty();

                                        var spanLeftPos = -($(this).css('font-size').slice(0, -2) / 1.3) / 2;
                                        var buildingID = $(this).data('building-id');

                                        // create glyph span

                                        $('<span />', {
                                            'class': 'glyphicon glyphicon-map-marker',
                                            'css': {
                                                'left': spanLeftPos
                                            }
                                        }).appendTo(el);

                                        //create a link element

                                        $('<a />', {
                                            'ui-sref': '/building/' + buildingID,
                                        }).appendTo($(el).find('span'));

                                        // create heading

                                        var h6LeftPos = ($(this).css('font-size').slice(0, -2) / 1.63) * 0.29;
                                        var h6FontSize = $(this).css('font-size').slice(0, -2) / 3.2;
                                        var h6LineHeight = $(this).css('font-size').slice(0, -2) / 1.7 - 2;
                                        var h6Width = $(this).css('font-size').slice(0, -2) / 1.6;
                                        var h6Height = $(this).css('font-size').slice(0, -2) / 1.6;
                                        var h6Bottom = $(this).css('font-size').slice(0, -2) / 2.8;
                                        var percent = Math.abs($(this).data('percent'));
                                        var letterSpacing = h6FontSize > 10 ? '-0.5px' : '0px';

                                        $('<h6 />', {
                                            'css': {
                                                'line-height': h6LineHeight + 'px',
                                                'left': h6LeftPos,
                                                'font-size': h6FontSize,
                                                'width': h6Width,
                                                'height': h6Height,
                                                'bottom': h6Bottom,
                                                'letter-spacing': letterSpacing
                                            },
                                            'html': percent
                                        }).appendTo($(el).find('a'));

                                        $('<div />', {
                                            'css': {
                                                'line-height': h6LineHeight + 'px',
                                                'left': h6LeftPos * 0.48,
                                                'font-size': h6FontSize,
                                                'width': h6Width * 1.3,
                                                'height': h6Height * 1.3,
                                                'bottom': h6Bottom * 0.75,
                                            },
                                            'class': 'markerCircle'
                                        }).appendTo($(el).find('a'));

                                    }).hoverIntent({
                                        over: function (e) {

                                            $('.blue').removeClass('blue');

                                            if ($location.path() === $(this).find('a').attr('href')) {
                                                return;
                                            }
                                            console.log(e);

                                            var showOnTop;

                                            if($(this).offset().top + 300 > window.innerHeight) {
                                              showOnTop = true;
                                            } else {
                                              showOnTop = false;
                                            }

                                            if (showOnTop) {
                                                $('#building').css('top', $(this).offset().top - 50 + 'px');
                                            } else {
                                                $('#building').css('top', $(this).offset().top + 100 + 'px');
                                            }

                                            $('#building').css('left', $(this).offset().left + 'px');

                                            $(this).toggleClass('blue');
                                            //$(this).clone().appendTo('#building');

                                            $location.path($(this).find('a').attr('ui-sref'));
                                            $scope.$apply();
                                            $scope.overTarget = true;

                                        },
                                        out: function () {
                                            $scope.overTarget = false;

                                        },
                                        timeout: 40,
                                        sensitivity: 5,
                                        interval: 200,
                                    }).on('mousedown', function (e) {

                                        $('.blue').removeClass('blue');

                                        if ($location.path() === $(this).find('a').attr('ui-sref')) {
                                            return;
                                        }

                                        var showOnTop;

                                        if($(this).offset().top + 300 > window.innerHeight) {
                                          showOnTop = true;
                                        } else {
                                          showOnTop = false;
                                        }

                                        if (showOnTop) {
                                            $('#building').css('top', $(this).offset().top - 50 + 'px');
                                        } else {
                                            $('#building').css('top', $(this).offset().top + 100 + 'px');
                                        }

                                        $('#building').css('left', $(this).offset().left + 'px');

                                        $(this).toggleClass('blue');
                                        //$(this).clone().appendTo('#building');

                                        $location.path($(this).find('a').attr('ui-sref'));
                                        $scope.$apply();
                                        $scope.overTarget = true;

                                    });

                                    

                                    $('google-map').on('mousemove', function (e) {

                                        //window.mouseX = e.pageX;
                                        //window.mouseY = e.pageY;
                                        $('.mapMarker').removeClass('blue');

                                        jQuery(document).ready(function ($) {

                                            if ($location.path().indexOf('/building') === 0) {

                                                $('#building .mapMarker').remove();
                                                $location.path('/').replace();
                                                $scope.$apply();
                                            }
                                        });

                                    });
                                }
                                var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
                                if (point) {
                                    div.style.left = point.x + 'px';
                                    div.style.top = point.y + 'px';
                                }
                            };


                            if ($scope.buildings && !$scope.mapped) {

                                var bounds = new google.maps.LatLngBounds();

                                $scope.mapped = true;
                                angular.forEach($scope.buildings, function (v) {

                                    var latlng = new google.maps.LatLng(v.coordinates.latitude, v.coordinates.longitude);
                                    bounds.extend(latlng);
                                    window.bounds = bounds;
                                    var overlay = new CustomMarker(latlng, window.map, 'mapMarker', v.id, v.savings.lastMonth);
                                    google.maps.event.addListener(overlay, 'mousedown', function () {

                                    });  

                                    map.fitBounds(bounds);

                                });



                                    angular.forEach($scope.buildings, function (v) {

                                    var latlng = new google.maps.LatLng(v.coordinates.latitude, v.coordinates.longitude);
                                    bounds.extend(latlng);
                                    window.bounds = bounds;

                                    map.fitBounds(bounds);



                                })

                            }
                        });
                        


                    },
                    click: function () {}
                }
            };

*/

    }
]);
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