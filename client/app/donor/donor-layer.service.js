'use strict';

angular.module('bloodDonationApp')
  .factory('DonorLayer', function ($q, Donors, EsriMap) {

    var layerId;

    var fields = [
      {
        name: 'ObjectID',
        alias: 'ObjectID',
        type: 'oid'
      },
      {
        name: 'firstName',
        alias: 'fName',
        type: 'string'
      },
      {
        name: 'lastName',
        alias: 'lName',
        type: 'string'
      },
      {
        name: 'bloodType',
        alias: 'bloodType',
        type: 'string'
      },
      {
        name: 'email',
        alias: 'email',
        type: 'string'
      },
      {
        name: 'tel',
        alias: 'tel',
        type: 'string'
      },
      {
        name: 'address',
        alias: 'address',
        type: 'string'
      }
    ];

    var popupTemplate = {
      title: '<i class="fa fa-user" aria-hidden="true"></i> {firstName}  {lastName} (type {bloodType})',
      overwriteActions: true,
      actions: [{
        title: 'Show info',
        id: 'show-info',
        className: 'esri-icon-description'
      }]
    };

    function showLayer(view, id) {
      if (!view) {
        return $q.reject('MapView is undefined');
      }
      getData(view)
        .then(res => $q.all(res.map(EsriMap.createGraphics)))
        .then(graphics => {

          var lyr = view.map.findLayerById(id);
          if (!lyr) {
            createLayer(view, graphics, id);
          }
          else {
            updateLayer(lyr, graphics);
          }

        });
    }

    function hideLayer(view, id) {
      var lyr = view.map.findLayerById(id);
      if (lyr) {
        lyr.visible = false;
      }
    }

    function addDonorToLayer(view, layerId, donor) {
      formatData(donor)
        .then(EsriMap.createGraphics)
        .then(gDonor => {
          var lyr = view.map.findLayerById(layerId);
          if (lyr) {
            lyr.source.push(gDonor);
          }
        });
    }

    function updateDonorOnLayer(view, layerId, donor) {
      formatData(donor)
        .then(EsriMap.createGraphics)
        .then(gDonorNew => {
          var lyr = view.map.findLayerById(layerId);
          if (lyr) {
            var g = lyr.source;
            var gDonorOld = g.find(item => {
              return item.attributes.ObjectID === gDonorNew.attributes.ObjectID;
            });
            g.remove(gDonorOld);
            g.push(gDonorNew);
          }
        });
    }

    function removeDonorFromLayer(view, layerId, donor) {
      var lyr = view.map.findLayerById(layerId);
      if (lyr) {
        var g = lyr.source;
        var gDonor = g.find(item => {
          return item.attributes.ObjectID === donor._id;
        });
        g.remove(gDonor);
      }
    }

    function createLayer(view, graphics, id) {
      var opts = {
        id: id,
        source: graphics,
        fields: fields,
        objectIdField: 'ObjectID',
        spatialReference: {
          wkid: 4326
        }
      }
      EsriMap.createLayer(opts)
        .then(res => {
          view.map.add(res.layer);
          customizePopup(view, res.layer);
        });
    }

    function updateLayer(layer, graphics) {
      layer.source.removeAll();
      layer.source.addMany(graphics);
      layer.visible = true;
    }

    function generateParam(extent) {
      return {
        location: {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: [[
                [extent.xmin, extent.ymin],
                [extent.xmax, extent.ymin],
                [extent.xmax, extent.ymax],
                [extent.xmin, extent.ymax],
                [extent.xmin, extent.ymin]
              ]]
            }
          }
        }
      };
    }

    function getData(view) {
      return EsriMap.projectToGeographic(view.extent)
        .then(extent => Donors.list(generateParam(extent)))
        .then(res => {
          if (res.data.length > 0) {
            return $q.all(res.data.map(formatData));
          }
          return $q.reject('Zero length data');
        });
    }

    function formatData(dat) {
      return $q.when({
        geometry: {
          longitude: dat.location.coordinates[0],
          latitude: dat.location.coordinates[1],
          spatialReference: {
            wkid: 4326
          }
        },
        attributes: {
          ObjectID: dat._id,
          firstName: dat.firstName,
          lastName: dat.lastName,
          bloodType: dat.bloodGroup,
          email: dat.email,
          tel: dat.contactNum,
          address: dat.address
        }
      });
    }

    function customizePopup(view, layer) {
      layer.popupTemplate = popupTemplate;

      view.popup.on('trigger-action', function (e) {
        if (e.action.id === 'show-info') {
          view.popup.close();
          layer.popupTemplate.content = '<i class="fa fa-envelope fa-fw" aria-hidden="true"></i> {email}<br/>' +
            '<i class="fa fa-phone fa-fw" aria-hidden="true"></i> {tel}<br/>';
          view.popup.open();
        }
      });

      view.on('click', function (e) {
        view.hitTest(e.screenPoint).then(function (res) {
          // if a marker is clicked
          if (res.results.length > 0 && res.results[0].graphic) {
            layer.popupTemplate.content = '';
          }
        });
      });
    }

    // Public API here
    return {
      showLayer: showLayer,
      hideLayer: hideLayer,
      add: addDonorToLayer,
      update: updateDonorOnLayer,
      remove: removeDonorFromLayer
    };
  });
