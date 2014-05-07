'use strict';

window.typekitLoad( 'gci4xol' );
var energyMap = angular.module('energyMap',[
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ]);

energyMap.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
