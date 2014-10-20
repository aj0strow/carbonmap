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