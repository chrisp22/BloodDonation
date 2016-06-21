'use strict';

angular.module('bloodDonationApp', ['bloodDonationApp.constants', 'ngCookies', 'ngResource',
    'ngSanitize', 'ngMessages', 'btford.socket-io', 'ui.router', 'ui.bootstrap', 'esri.map'
  ])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  });
