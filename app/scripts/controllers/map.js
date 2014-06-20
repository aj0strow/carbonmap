'use strict';

var energyMap = energyMap || [];
var google = google || [];
var jQuery = jQuery || [];
var $ = jQuery || [];
energyMap.factory('buildingsFactory', ['$http', function ($http) {
    return {
        getBuildings: function (callback) {
            $http.get('/api/buildings/buildings.json').success(callback);
        }
    };
}])
    .factory('buildingFactory', ['$http', function ($http) {
        return {
            getBuilding: function (id, callback) {
                $http.get('/api/building/' + id + '.json').success(callback);
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
    '_',
    '$http',
    '$timeout',
    '$location',
    'matchmedia',
    function ($scope, buildingsFactory, _, $http, $timeout, $location, matchmedia) {


        $scope.abs = Math.abs;

        $scope.buildings = {};
        $scope.savingsOverview = {};

        buildingsFactory.getBuildings(function (results) {

            results = _.sortBy(results, function (result) {
                //element will be each array, so we just return a date from first element in it
                return result.savings.lastMonth;
            });
            $scope.buildings = results;
            window.buildings = $scope.buildings;

            angular.forEach(results, function (value) {
                $scope.savingsOverview.fiveYear = 0;
                $scope.savingsOverview.fiveYear += parseInt(value.savings.fiveYear);
            });
        });

        var mapStyles = [{
            'featureType': 'administrative',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'poi',
            'stylers': [{
                'visibility': 'simplified'
            }]
        }, {
            'featureType': 'road',
            'stylers': [{
                'visibility': 'simplified'
            }]
        }, {
            'featureType': 'water',
            'stylers': [{
                'visibility': 'simplified'
            }]
        }, {
            'featureType': 'transit',
            'stylers': [{
                'visibility': 'simplified'
            }]
        }, {
            'featureType': 'landscape',
            'stylers': [{
                'visibility': 'simplified'
            }]
        }, {
            'featureType': 'road.highway',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'road.local',
            'stylers': [{
                'visibility': 'on'
            }]
        }, {
            'featureType': 'road.highway',
            'elementType': 'geometry',
            'stylers': [{
                'visibility': 'on'
            }]
        }, {
            'featureType': 'road.arterial',
            'stylers': [{
                'visibility': 'off'
            }]
        }, {
            'featureType': 'water',
            'stylers': [{
                'color': '#5f94ff'
            }, {
                'lightness': 26
            }, {
                'gamma': 5.86
            }]
        }, {}, {
            'featureType': 'road.highway',
            'stylers': [{
                'weight': 0.6
            }, {
                'saturation': -85
            }, {
                'lightness': 61
            }]
        }, {
            'featureType': 'road'
        }, {}, {
            'featureType': 'landscape',
            'stylers': [{
                'color': '#FAF9EA'
            }]
        }, {
            'featureType': 'poi.park',
            'stylers': [{
                'color': '#F2F7E9'
            }]
        }];

        matchmedia.onLandscape(function(){



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
                draggable: true,
                events: {
                    tilesloaded: function (map) {
                        $scope.$apply(function () {

                            window.map = map;
                            $scope.mapInstance = map;

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


                                jQuery(window).on('resize', function(){

                                    angular.forEach($scope.buildings, function (v) {

                                    var latlng = new google.maps.LatLng(v.coordinates.latitude, v.coordinates.longitude);
                                    bounds.extend(latlng);
                                    window.bounds = bounds;

                                    map.fitBounds(bounds);

                                });


                                })

                            }
                        });
                    },
                    click: function () {}
                }
            };
        // end onlandscape
        });
    }
]);