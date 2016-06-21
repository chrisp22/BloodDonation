'use strict';

angular.module('bloodDonationApp')
  .controller('EsriSearchCtrl', function ($element, EsriMap) {
    var self = this;
    var element = $element[0];

    self.options = this.searchOptions() || {};

    /**
     * @ngdoc function
     * @name initWidget
     * @methodOf EsriSearchCtrl
     *
     * @description
     * Initialize the Esri Search Widget
     *
     * @param {Object} view view instance
     */
    this.initWidget = function(view) {
      if (!view) {
          return;
      }

      if (!self.widget) {
        EsriMap.setSearchWidget(view, self.options, element).then(widget => {
          self.widget = widget;
        });
      }
      else {
        self.widget.view = view;
      }
      
    };

    /**
     * @ngdoc function
     * @name destroyWidget
     * @methodOf EsriSearchCtrl
     *
     * @description
     * Destroy the Esri Search Widget
     *
     */
    this.destroyWidget = function() {
      if (self.widget) {
        self.widget.destroy();
      }
    }

  });
