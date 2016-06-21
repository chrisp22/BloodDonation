'use strict';

angular.module('bloodDonationApp')
  .factory('EsriMap', function ($q, $http, Donors, esriLoader, esriRegistry) {
    
    var mapLocator;
    var lyrId = 'donorLayer';

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

    function initMap() {
      var res = $q.defer();
      esriLoader.require([
        'esri/Map'
      ], (Map) => {
        var map = new Map({
          basemap: baseMap
        });
        res.resolve(map);
      });
      return res.promise;
    }

    function initView(view) {
      self.mapView = view;
      esriLoader.require([
        'esri/widgets/Locate',
        'esri/widgets/Search'
      ], (Locate, Search) => {

        view.padding = defMapViewProp.padding;

        var locateOptions = {
          view: view,
          goToLocationEnabled: false,
          graphic: null
        };
        setLocateWidget(view, locateOptions);

      });
    }

    function setLocateWidget(view, properties) {
      properties.view = view;
      esriLoader.require([
        'esri/widgets/Locate'
      ], (Locate) => {

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
      var res = $q.defer();
      esriLoader.require([
        'esri/widgets/Search'
      ], (Search) => {

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

          res.resolve(searchWidget);

      });

      return res.promise;
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

        self.mapView.graphics.removeAll();
        self.mapView.graphics.add(marker);
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
      if (!visible && self.mapView) {
        self.mapView.graphics.removeAll();
      }
    }

    function loadDonorsLayer() {
      Donors.getWithinBox(self.mapView.center, (self.mapView.extent.xmax - self.mapView.extent.xmin) / 2)
        .then(res => {
          var markers = res.data.map(createGraphics);
          return $q.all(markers);
        })
        .then(createLayer);
    }

    function addDonorToLayer(donor) {
      createGraphics(donor)
        .then(function (gDonor) {
          var lyr = self.mapView.map.findLayerById(lyrId);
          if (lyr) {
            lyr.source.push(gDonor);
          }
        });
    }

    function updateDonorOnLayer(donor) {
      createGraphics(donor)
        .then(function (gDonorNew) {
          var lyr = self.mapView.map.findLayerById(lyrId);
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
      var lyr = self.mapView.map.findLayerById(lyrId);
      if (lyr) {
        var g = lyr.source;
        var gDonor = g.find(function (item) {
          return item.attributes.ObjectID === donor._id;
        });
        g.remove(gDonor);
      }
    }

    function createGraphics(dat) {
      var res = $q.defer();
      esriLoader.require([
        'esri/geometry/Point',
      ], function (Point) {
        res.resolve({
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
        });
      });
      return res.promise;
    }

    function createLayer(graphics) {
      var mapView = self.mapView;
      var lyr;

      esriLoader.require([
        'esri/widgets/Popup',
        'esri/renderers/SimpleRenderer',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/layers/FeatureLayer'
      ], function (Popup, SimpleRenderer, SimpleMarkerSymbol, FeatureLayer) {
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
          lyr = self.mapView.map.findLayerById(lyrId);
          mapView.popup = new Popup();
          if (lyr) {
            self.mapView.map.remove(lyr);
          }
          else {
            lyr = new FeatureLayer({
              id: lyrId,
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

          self.mapView.map.add(lyr);

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
      initMap: initMap,
      initView: initView,
      getMapView: getMapView,
      zoomToLocation: zoomToLocation,
      moveToCurrentPosition: moveToCurrentPosition,
      getLocationInfo: getLocationInfo,
      setLocationInfo: setLocationInfo,
      setLocMarkerVisible: setLocMarkerVisible,
      loadDonorsLayer: loadDonorsLayer,
      addDonorToLayer: addDonorToLayer,
      updateDonorOnLayer: updateDonorOnLayer,
      removeDonorFromLayer: removeDonorFromLayer,
      setSearchWidget: setSearchWidget
    };
  });
