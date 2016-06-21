'use strict';

class NavbarController {
  
  constructor(EsriMap) {
    this.esriMap = EsriMap;
  }

  $onInit() {

    this.esriMap.getMapView().then(res => {
      this.view = res.view;
    });

  }

}

//end-non-standard

angular.module('bloodDonationApp')
  .controller('NavbarController', NavbarController);
