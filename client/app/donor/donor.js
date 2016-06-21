'use strict';

angular.module('bloodDonationApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.donor', {
        url: 'donor?id',
        template: '<donor></donor>'
      });
  });
