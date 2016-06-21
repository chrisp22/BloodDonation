'use strict';

(function() {

  class MainController {

    constructor($rootScope, $scope, socket, $state, EsriMap) {
      this.socket = socket;
      this.state = $state;
      this.esriMap = EsriMap;

      $rootScope.$on('$stateChangeStart', 
        (evt, toState, toParams) => {
          if (!toParams.id) {
            this.esriMap.moveToCurrentPosition();
          }
          
          if (toState.name === 'main') {
            this.esriMap.setLocMarkerVisible(false);
            this.esriMap.loadDonorsLayer();
          }
      });

    }

    $onInit() {
      this.esriMap.setLocMarkerVisible(false);

      // bind the map to the Esri MapView Directive
      this.esriMap.initMap().then(map => {
        this.map = map;
      });

      this.onViewCreated = (view) => {
        // customize the view
        this.esriMap.initView(view);

        if (!this.state.params.id) {
          this.esriMap.moveToCurrentPosition();
        }
        
        // watch changes in map extent
        view.watch('center,scale,zoom', () => {  
          if (this.state.current.name === 'main'){ 
            this.esriMap.loadDonorsLayer();
          }
        });
      };

      var donors = [];
      if (this.state.params.id) {
        donors.push({ _id: this.state.params.id });
      }
      this.socket.syncUpdates('donor', donors, (evt, donor) => {
        switch(evt) {
          case 'created':
            this.esriMap.addDonorToLayer(donor);
            break;
          case 'updated':
            this.esriMap.updateDonorOnLayer(donor);
            break;
          case 'deleted':
            this.esriMap.removeDonorFromLayer(donor);
            break;
        }
      });
    }

    $onDestroy() {
      this.socket.unsyncUpdates('donor');
    }

  }

  angular.module('bloodDonationApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    });
})();
