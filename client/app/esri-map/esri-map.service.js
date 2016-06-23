'use strict';

angular.module('bloodDonationApp')
  .factory('EsriMap', function ($q, Donors, esriLoader, esriRegistry) {

    var mapView;
    
    var mapLocator;
    var donorLyrId = 'donorLayer';

    var locMarkerVisible = true;

    var baseMap = 'gray';

    var defMapViewProp = {
      zoom: 8,
      center: [-101.17, 21.78],
      scale: 2400000,
      padding: {
        top: 65
      }
    };

    var locInfo = {
      address: '',
      coordinates: []
    };

    function getMap() {
      return esriLoader.require([
        'esri/Map'
      ]).then(esriModules => {
        var Map = esriModules[0];
        if (mapView) {
          return mapView.map;
        }
        else {
          return new Map({
            basemap: baseMap
          });
        }
      });
    }

    function initView(view) {
      mapView = view;
      mapView.padding = defMapViewProp.padding;

      var locateOptions = {
        view: mapView,
        goToLocationEnabled: false,
        graphic: null
      };

      setLocateWidget(mapView, locateOptions);
    }

    function setLocateWidget(view, properties) {
      properties.view = view;
      esriLoader.require([
        'esri/widgets/Locate'
      ]).then(esriModules => {
        var Locate = esriModules[0];

        var locateWidget = new Locate(properties);
        locateWidget.startup();
        view.ui.add(locateWidget, 'top-left');
        locateWidget.on('locate', evt => {
          setLocationInfo(evt.position.coords);
          zoomToLocation(evt.position.coords);
        });
      });
    }

    function setSearchWidget(view, properties, srcNodeRef) {
      properties.view = view;
      return esriLoader.require([
        'esri/widgets/Search'
      ]).then(esriModules => {

        var Search = esriModules[0];

        var searchWidget = new Search(properties, srcNodeRef);

        searchWidget.startup();
        searchWidget.on('search-complete', e => {
          var res = e.results[0].results[0];

          locInfo.coordinates = [res.feature.geometry.longitude, res.feature.geometry.latitude];
          locInfo.address = res.name;

          zoomToLocation({
            longitude: res.feature.geometry.longitude,
            latitude: res.feature.geometry.latitude
          });
        });

        return searchWidget;

      });
    }

    function zoomToLocation(coords) {
      getMapView().then(function(res) {
        res.view.goTo({
          target: [coords.longitude, coords.latitude],
          zoom: defMapViewProp.zoom
        });

        if (locMarkerVisible) {
          moveLocMarker(coords);
        }
      });
    }

    /**
     * moveLocMarker Draw a marker to the map
     * @param {Object} coords Coordinate position
     * @return {Graphic} marker The marker
     */
    function moveLocMarker(coords) {
      esriLoader.require([
        'esri/geometry/Point',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Graphic'
      ], function (Point, SimpleMarkerSymbol, Graphic) {
        var marker = new Graphic({
          symbol: new SimpleMarkerSymbol({ color: 'blue' }),
          geometry: new Point(0, 0)
        });
        marker.geometry.longitude = coords.longitude;
        marker.geometry.latitude = coords.latitude;

        mapView.graphics.removeAll();
        mapView.graphics.add(marker);
      });
    }

    function moveToCurrentPosition() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (loc) {
          setLocationInfo(loc.coords);
          zoomToLocation(loc.coords);
        });
      }
    }

    function getLocationInfo() {
      return locInfo;
    }

    function setLocationInfo(coords, address) {
      locInfo.coordinates = [coords.longitude, coords.latitude];
      if (address) {
        locInfo.address = address;
      }
      else {
        esriLoader.require([
          'esri/geometry/Point',
          'esri/tasks/Locator'
        ], function (Point, Locator) {
          // map locator
          if (!mapLocator) {
            mapLocator = new Locator('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer');
          }
          mapLocator.locationToAddress(new Point(coords)).then(function (res) {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            locInfo.address = res.address.Match_addr;
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
          });
        });
      }
      
    }

    function getMapView() {
      return esriRegistry.get('donorMap');
    }

    function setLocMarkerVisible(visible) {
      locMarkerVisible = visible;
      if (!visible && mapView) {
        mapView.graphics.removeAll();
      }
    }

    function loadDonorsLayer() {
      Donors.getWithinBox(mapView.center, (mapView.extent.xmax - mapView.extent.xmin) / 2)
        .then(res => {
          var markers = res.data.map(createGraphics);
          return $q.all(markers);
        })
        .then(createLayer);
    }

    function unloadDonorsLayer() {
      var lyr = mapView.map.findLayerById(donorLyrId);
      if (lyr) {
        mapView.map.remove(lyr);
      }
    }

    function addDonorToLayer(donor) {
      createGraphics(donor)
        .then(function (gDonor) {
          var lyr = mapView.map.findLayerById(donorLyrId);
          if (lyr) {
            lyr.source.push(gDonor);
          }
        });
    }

    function updateDonorOnLayer(donor) {
      createGraphics(donor)
        .then(function (gDonorNew) {
          var lyr = mapView.map.findLayerById(donorLyrId);
          if (lyr) {
            var g = lyr.source;
            var gDonorOld = g.find(function (item) {
              return item.attributes.ObjectID === gDonorNew.attributes.ObjectID;
            });
            g.remove(gDonorOld);
            g.push(gDonorNew);
          }
        });
    }

    function removeDonorFromLayer(donor) {
      var lyr = mapView.map.findLayerById(donorLyrId);
      if (lyr) {
        var g = lyr.source;
        var gDonor = g.find(function (item) {
          return item.attributes.ObjectID === donor._id;
        });
        g.remove(gDonor);
      }
    }

    function createGraphics(dat) {
      return esriLoader.require([
        'esri/geometry/Point',
      ]).then(esriModules => {
        var Point = esriModules[0];

        return {
          geometry: new Point({
            x: dat.location.coordinates[0],
            y: dat.location.coordinates[1]
          }),
          attributes: {
            ObjectID: dat._id,
            name: dat.firstName + ' ' + dat.lastName,
            bloodType: dat.bloodGroup,
            email: dat.email,
            tel: dat.contactNum,
            address: dat.address
          }
        };

      });
    }

    function createLayer(graphics) {
      esriLoader.require([
        'esri/widgets/Popup',
        'esri/renderers/SimpleRenderer',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/layers/FeatureLayer'
      ]).then(esriModules => {
        var Popup = esriModules[0];
        var SimpleRenderer = esriModules[1];
        var SimpleMarkerSymbol = esriModules[2];
        var FeatureLayer = esriModules[3];

        var fields = [
          {
            name: 'ObjectID',
            alias: 'ObjectID',
            type: 'oid'
          },
          {
            name: 'name',
            alias: 'name',
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

        var donorsRenderer = new SimpleRenderer({
          symbol: new SimpleMarkerSymbol({
            size: 12,
            color: 'red',
            outline: {
              width: 0.5,
              color: 'white'
            }
          })
        });

        var donorsPopup = {
          title: '<i class="fa fa-user" aria-hidden="true"></i> {name} (type {bloodType})',
          overwriteActions: true,
          actions: [{
            title: 'Show info',
            id: 'show-info',
            className: 'esri-icon-description'
          }, {
              title: 'Hide info',
              id: 'hide-info',
              visible: false
            }]
        };

        if (graphics.length > 0) {
          var lyr = mapView.map.findLayerById(donorLyrId);
          mapView.popup = new Popup();
          if (lyr) {
            mapView.map.remove(lyr);
          }
          else {
            lyr = new FeatureLayer({
              id: donorLyrId,
              source: graphics,
              fields: fields,
              popupTemplate: donorsPopup,
              renderer: donorsRenderer,
              spatialReference: {
                wkid: 4326
              },
              objectIdField: 'ObjectID',
              geometryType: 'point'
            });
          }

          mapView.map.add(lyr);

          mapView.popup.on('trigger-action', function (e) {
            if (e.action.id === 'show-info') {
              lyr.popupTemplate.content = '<i class="fa fa-envelope fa-fw" aria-hidden="true"></i> {email}<br/>' +
                '<i class="fa fa-phone fa-fw" aria-hidden="true"></i> {tel}<br/>';
              mapView.popup.close();
              mapView.popup.open();
            }
            if (e.action.id === 'hide-info') {
              lyr.popupTemplate.content = '';
            }
          });

          mapView.on('click', function (e) {
            mapView.hitTest(e.screenPoint).then(function (response) {
              // if a marker is clicked
              if (response.results.length > 0 && response.results[0].graphic) {
                mapView.popup.triggerAction(1);
              }
            });
          });
        }
      });
    }

    // Public API here
    return {
      getMap: getMap,
      initView: initView,
      getMapView: getMapView,
      zoomToLocation: zoomToLocation,
      moveToCurrentPosition: moveToCurrentPosition,
      getLocationInfo: getLocationInfo,
      setLocationInfo: setLocationInfo,
      setLocMarkerVisible: setLocMarkerVisible,
      loadDonorsLayer: loadDonorsLayer,
      unloadDonorsLayer: unloadDonorsLayer,
      addDonorToLayer: addDonorToLayer,
      updateDonorOnLayer: updateDonorOnLayer,
      removeDonorFromLayer: removeDonorFromLayer,
      setSearchWidget: setSearchWidget
    };
  });
