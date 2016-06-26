'use strict';

angular.module('bloodDonationApp')
  .factory('EsriMap', function ($q, esriLoader) {
    var deferredMapView = $q.defer();

    var mapView;
    var mapViewProp = {
      zoom: 3,
      padding: {
        top: 65
      }
    };
    var mapProp = {
      basemap: 'gray'
    };

    var mapLocator;

    var locationMarker;

    function initialize(mapViewDiv) {
      return setMap({ basemap: mapProp.basemap })
        .then(map => {
          mapViewProp.map = map;
          mapViewProp.container = mapViewDiv;
          return setMapView(mapViewProp);
        });
    }

    function setMap(properties) {
      return esriLoader.require(['esri/Map'])
        .then(esriModules => {
          var Map = esriModules[0];
          return new Map(properties);
        });
    }

    function setMapView(properties) {
      return esriLoader.require(['esri/views/MapView'])
        .then(esriModules => {
          var MapView = esriModules[0];
          mapView = new MapView(properties);
          deferredMapView.resolve({ view: mapView });
          return deferredMapView.promise;
        });
    }

    function getMapView() {
      return deferredMapView.promise;
    }

    function setLocateWidget(opts) {
      var srcNodeRef;

      if (!opts || !opts.view) {
        return $q.reject('MapView is undefined');
      }

      srcNodeRef = opts.container;

      opts.container = undefined;
      opts.goToLocationEnabled = false;
      opts.graphic = null;

      return esriLoader.require([
        'esri/widgets/Locate'
      ]).then(esriModules => {
        var Locate = esriModules[0];

        var locateWidget = new Locate(opts, srcNodeRef);
        locateWidget.startup();

        if (!srcNodeRef) {
          opts.view.ui.add(locateWidget, 'top-left');
        }

        locateWidget.on('locate', e => {
          zoomToLocation({
            view: opts.view,
            coordinates: e.position.coords
          });
        });

        return locateWidget;
      });

    }

    function setSearchWidget(opts) {
      var srcNodeRef;

      if (!opts || !opts.view) {
        return $q.reject('MapView is undefined');
      }

      srcNodeRef = opts.container;

      opts.container = undefined;
      opts.showPopupOnSelect = false;
      opts.autoSelect = false;

      return esriLoader.require([
        'esri/widgets/Search'
      ]).then(esriModules => {
        var Search = esriModules[0];

        var searchWidget = new Search(opts, srcNodeRef);
        searchWidget.startup();

        if (!srcNodeRef) {
          opts.view.ui.add(searchWidget, 'top-right');
        }

        searchWidget.on('search-complete', e => {
          if (e.results.length > 0 && e.results[0].results.length > 0) {
            var res = e.results[0].results[0];
            var coords = {
              longitude: res.feature.geometry.longitude,
              latitude: res.feature.geometry.latitude
            };

            zoomToLocation({
              view: opts.view,
              coordinates: coords,
              address: res.name
            });
          }
        });

        return searchWidget;

      });
    }

    function setLocationMarker(opts) {
      return esriLoader.require([
        'esri/Graphic',
        'esri/symbols/support/jsonUtils',
        'esri/geometry/Point'
      ]).then(esriModules => {
        var Graphic = esriModules[0];
        var jsonUtils = esriModules[1];
        var Point = esriModules[2];

        locationMarker = new Graphic({
          symbol: jsonUtils.fromJSON(opts.symbol),
          geometry: new Point({
            x: 0,
            y: 0,
            spatialReference: {
              wkid: 4326
            }
          }),
          visible: opts.visible
        });

        return locationMarker;
      });
    }

    function updateLocationMarker(opts) {
      if (opts && opts.view) {
        var view = opts.view;
        var marker = locationMarker.clone();
        var geometry = marker.geometry.clone();

        if (opts.geometry) {
          geometry.set(opts.geometry);
          opts.geometry = geometry;
        }
        opts.view = undefined;

        view.graphics.remove(locationMarker);
        marker.set(opts);
        view.graphics.add(marker);
        locationMarker = marker;
      }
    }

    function zoomToLocation(opts) {
      if (opts.view) {
        opts.zoom = opts.zoom || 8;
        opts.view.goTo({
          target: [opts.coordinates.longitude, opts.coordinates.latitude],
          zoom: opts.zoom
        });

        // update the marker
        if (!opts.address) {
          var promise = coordinatesToAddress(opts.coordinates);
        }
        else {
          var promise = $q.when(opts.address);
        }
        promise.then(address => {
          updateLocationMarker({
            view: opts.view,
            attributes: {
              address: address
            },
            geometry: {
              longitude: opts.coordinates.longitude,
              latitude: opts.coordinates.latitude
            }
          });
        });

      }
    }

    function moveToCurrentPosition(view) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (loc) {
          zoomToLocation({
            view: view,
            coordinates: loc.coords
          });
        });
      }
    }

    function getLocationInfo() {
      return {
        address: locationMarker.getAttribute('address'),
        coordinates: [locationMarker.geometry.longitude, locationMarker.geometry.latitude]
      };
    }

    function coordinatesToAddress(coords) {
      return esriLoader.require([
        'esri/geometry/Point',
        'esri/tasks/Locator'
      ]).then(esriModules => {
        var Point = esriModules[0];
        // map locator
        if (!mapLocator) {
          var Locator = esriModules[1];
          mapLocator = new Locator('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer');
        }
        return mapLocator.locationToAddress(new Point(coords)).then(function (res) {
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          return res.address.Match_addr;
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        });
      });
    }

    function projectToGeographic(geom) {
      return esriLoader.require([
        'esri/geometry/support/webMercatorUtils',
        'esri/geometry/SpatialReference'
      ]).then(esriModules => {
        var webMercatorUtils = esriModules[0];
        var SpatialReference = esriModules[1];

        if (webMercatorUtils.canProject(geom.spatialReference, SpatialReference.WGS84)) {
          return webMercatorUtils.project(geom, SpatialReference.WGS84);
        }
        return geom;
      });
    }

    function createGraphics(dat) {
      return esriLoader.require([
        'esri/geometry/Point',
      ]).then(esriModules => {
        var Point = esriModules[0];

        return {
          geometry: new Point(dat.geometry),
          attributes: dat.attributes
        };

      });
    }

    function createLayer(opts) {
      return esriLoader.require([
        'esri/widgets/Popup',
        'esri/renderers/SimpleRenderer',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/layers/FeatureLayer',
        'esri/renderers/support/jsonUtils'
      ]).then(esriModules => {
        var Popup = esriModules[0];
        var SimpleRenderer = esriModules[1];
        var SimpleMarkerSymbol = esriModules[2];
        var FeatureLayer = esriModules[3];
        var Renderers = esriModules[4];

        if (!opts.renderer) {
          if (locationMarker) {
            opts.renderer = new SimpleRenderer({
              symbol: locationMarker.symbol
            });
          }
          else {
            opts.renderer = new SimpleRenderer({
              symbol: new SimpleMarkerSymbol({
                size: 12,
                color: 'red',
                outline: {
                  width: 0.5,
                  color: 'white'
                }
              })
            });
          }
        }
        else {
          opts.renderer = Renderers.fromJSON(opts.renderer);
        }
        
        var lyr = {};

        if (opts.source.length > 0) {
          //mapView.popup = new Popup();

          var lyr = new FeatureLayer({
            id: opts.id,
            source: opts.source,
            fields: opts.fields,
            renderer: opts.renderer,
            spatialReference: opts.spatialReference,
            objectIdField: opts.objectIdField,
            geometryType: opts.renderer.type,
            visible: true
          });

        }

        return { layer: lyr };
      });
    }

    // Public API here
    return {
      initialize: initialize,
      getMapView: getMapView,
      setLocateWidget: setLocateWidget,
      setSearchWidget: setSearchWidget,
      setLocationMarker: setLocationMarker,
      updateLocationMarker: updateLocationMarker,
      zoomToLocation: zoomToLocation,
      moveToCurrentPosition: moveToCurrentPosition,
      getLocationInfo: getLocationInfo,
      createGraphics: createGraphics,
      createLayer: createLayer,
      projectToGeographic: projectToGeographic
    };
  });
