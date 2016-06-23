'use strict';
(function(){

class DonorComponent {
  constructor($scope, $state, $timeout, socket, Donors, EsriMap) {
    this.scope = $scope;
    this.state = $state;
    this.timeout = $timeout;
    this.socket = socket;
    this.donorFctry = Donors;
    this.esriMap = EsriMap;
  }

  $onInit() {
    this.donor = this.initDonorInfo(this.state.params.id);

    this.uniqueUrl = '';
    this.showForm = true;
    this.panelIsCollapsed = true;
    this.panelIsCollapsible = true;
    this.panelTitle = 'Sign Up';
    this.submitBtnName = 'Sign Up';

    this.alerts = [];

    this.panelBody = '';
    this.uniqueUrl = '';

    this.initState();
  }

  /**
   * Initialize donor
   * 
   * @param {string} donorId The id of the Donor
   */
  initDonorInfo(donorId) {
    return {
      _id: donorId,
      address: '',
      location: {
        type: 'Point',
        coordinates: []
      }
    };
  }

  collapsePanel() {
    this.panelIsCollapsed = true;
    this.showForm = true;
    this.uniqueUrl = '';
  }

  addAlert (alert) {
    this.alerts.push(alert);
  }

  closeAlert(index) {
    this.alerts.splice(index, 1);
  }

  /**
   * Initialize the state
   */
  initState() {
    // initialize substate
    if(!this.donor._id) {
      this.initSignUp(); // signup state
    }
    else {
      this.initEditInfo(); // update info state
    }
  }

  initSignUp() {
    this.esriMap.getMapView().then(res => {
      var mapView = res.view;
      
      // monitor map click event
      mapView.on('click', e => {
        mapView.hitTest(e.screenPoint).then(res => {
          // if a marker is clicked
          if(res.results.length > 0 && res.results[0].graphic){
            var locInfo = this.esriMap.getLocationInfo();
            this.donor.address = locInfo.address;
            this.donor.location.coordinates = locInfo.coordinates;
            this.scope.$apply(() => {
              this.panelIsCollapsed = false;
            });
          }
        });
      });
    });
  }

  initEditInfo() {
    this.donorFctry.get(this.donor._id).then(res => {
      this.donor = res.data;
      var coords = {
        longitude: res.data.location.coordinates[0],
        latitude: res.data.location.coordinates[1]
      };
      this.esriMap.zoomToLocation(coords);
      this.panelTitle = 'Update Info';
      this.submitBtnName = 'Update';
      this.panelIsCollapsed = false;
      this.panelIsCollapsible = false;
    }, res => {
      this.addAlert({ type: 'danger', msg: 'id not found', timeout: 2000 });

      this.timeout(() => {
        this.state.go('.', { id: undefined })
      }, 2000);
    });
  }

  /**
   * Submit form data
   * 
   * @param {boolean} isValid true if the form is valid
   */
  submitDonor(isValid) {
    if (!isValid) {
      this.scope.$broadcast('show-errors-check-validity', 'donorForm');
      return false;
    }
            
    if(!this.donor._id) { 
      this.donorFctry.create(this.donor).then(res => {
        this.donor._id = res.data._id;

        this.panelBody = 'Here is your unique link to view or modify your information:';
        this.uniqueUrl = this.state.href(this.state.current.name, { id: res.data._id }, {absolute: true});
        this.showForm = false;
        this.donor = this.initDonorInfo();
      }, res => {
        this.addAlert({ type: 'danger', msg: res.data.message, timeout: 2000 });
      });
    }
    else {
      this.showForm = true;
    
      this.donorFctry.update(this.donor).then(res => {
        this.addAlert({ type: 'success', msg: 'your information was updated', timeout: 2000 });
      }, res => {
        this.addAlert({ type: 'danger', msg: res.data.message, timeout: 2000 });
      });
    }
  }

  /**
   * Deletes Donor matching the form data
   */
  deleteDonor() {
    this.donorFctry.remove(this.donor._id).then(res => {
      this.addAlert({ type: 'danger', msg: 'donor info deleted', timeout: 2000 });

      this.timeout(res => {
        this.state.go('.', { id: undefined })
      }, 2000);
    }, res => {
      this.addAlert({ type: 'danger', msg: res.data.message, timeout: 2000 });
    });
  }

}

angular.module('bloodDonationApp')
  .component('donor', {
    templateUrl: 'app/donor/donor.html',
    controller: DonorComponent
  });

})();
