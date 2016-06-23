'use strict';

(function() {

  class MainController {

    constructor($rootScope, $scope, socket, $state, EsriMap) {
      this.socket = socket;
      this.state = $state;
      this.esriMap = EsriMap;

      $rootScope.$on('$stateChangeStart', 
        (evt, toState, toParams) => {

          this.mapView.popup.close();
          switch(toState.name) {
            case 'main':
              this.esriMap.setLocMarkerVisible(false);
              this.esriMap.loadDonorsLayer();
              break;
            case 'main.donor':
              this.esriMap.setLocMarkerVisible(true);
              this.esriMap.unloadDonorsLayer();
              if (!toParams.id) {
                this.esriMap.moveToCurrentPosition();
              }
          }

      });

    }

    $onInit() {

      // bind the map to the Esri MapView Directive
      this.esriMap.getMap().then(map => {
        this.map = map;
      });

      this.onViewCreated = (view) => {
        this.mapView = view;

        view.popup.close();
        switch(this.state.current.name) {
          case 'main':
            this.esriMap.setLocMarkerVisible(false);
            break;
          case 'main.donor':
            this.esriMap.setLocMarkerVisible(true);
        }
        if (!this.state.params.id) {
          this.esriMap.moveToCurrentPosition();
        }

        // customize the view
        this.esriMap.initView(view);

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
