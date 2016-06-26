'use strict';

(function () {

  class MainController {

    constructor($rootScope, $scope, socket, $state, EsriMap, DonorLayer) {
      this.socket = socket;
      this.state = $state;
      this.esriMap = EsriMap;
      this.donorLayer = DonorLayer;

      $rootScope.$on('$stateChangeStart',
        (evt, toState, toParams) => {

          this.mapView.popup.close();
          switch (toState.name) {
            case 'main':
              this.esriMap.updateLocationMarker({
                view: this.mapView,
                visible: false
              });
              this.donorLayer.showLayer(this.mapView, 'donorLayer');
              break;
            case 'main.donor':
              this.esriMap.updateLocationMarker({
                view: this.mapView,
                visible: true
              });
              this.donorLayer.hideLayer(this.mapView, 'donorLayer');
          }
          if (!toParams.id) {
            this.esriMap.moveToCurrentPosition(this.mapView);
          }

        });

    }

    $onInit() {
      this.donorLayerId = 'donorLayer';

      this.esriMap.initialize('mapDiv').then(res => {
        this.mapView = res.view;

        this.esriMap.setLocateWidget({ view: this.mapView }); // attach a locate widget
        this.esriMap.setSearchWidget({ // attach a search widget
          view: this.mapView, 
          container: 'esriSearchDiv'
        });
        this.esriMap.setLocationMarker({ // set the marker
          symbol: {
            type: "esriPMS",
            url: 'assets/images/pin.png',
            height: 27,
            width: 27,
            yoffset: 12
          },
          visible: this.state.current.name !== 'main'
        });

        if (!this.state.params.id) {
          this.esriMap.moveToCurrentPosition(this.mapView);
        }

        this.mapView.watch("animation,interacting", res => {
          if(!res) {
            if (this.state.current.name === 'main') {
              this.donorLayer.showLayer(this.mapView, this.donorLayerId);
            }
          }
        });

      });

      var donors = [];
      if (this.state.params.id) {
        donors.push({ _id: this.state.params.id });
      }
      this.socket.syncUpdates('donor', donors, (evt, donor) => {
        switch (evt) {
          case 'created':
            this.donorLayer.add(this.mapView, this.donorLayerId, donor);
            break;
          case 'updated':
            this.donorLayer.update(this.mapView, this.donorLayerId, donor);
            break;
          case 'deleted':
            this.donorLayer.remove(this.mapView, this.donorLayerId, donor);
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
