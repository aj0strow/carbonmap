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
    'google-maps',
    'matchmedia-ng'
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
          url: 'what-is-carbon-savings'
        });

    $stateProvider.state('map.about', {
        views: {
          'about': {
              templateUrl: 'partials/about.html',
            }
          },
          url: 'about'
        });
  });