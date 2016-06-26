'use strict';

describe('Service: EsriMap', () => {

  // load the service's module
  beforeEach(module('bloodDonationApp'));

  // instantiate service
  var EsriMap;
  var scope;

  // define variables
  var mapView;

  beforeEach(inject((_EsriMap_, esriLoader, $q, $rootScope) => {
    EsriMap = _EsriMap_;
    scope = $rootScope.$new();

    mapView = {};

    var defModules = $q.defer();
    spyOn(esriLoader, 'require').and.callFake((res) => {
      var ret = [];
      angular.forEach(res, r => ret.push(prop => prop));
      defModules.resolve(ret);
      return defModules.promise;
    });
  }));

  describe('initialize()', () => {
    afterEach(() => {
      scope.$digest();
    });

    it('should create a map object', () => {
      var mapViewContainer = 'mapViewDiv';
      EsriMap.initialize(mapViewContainer).then((res) => {
        expect(res.view).toBeDefined();
        expect(res.view.container).toBe(mapViewContainer);
        expect(res.view.map).toBeDefined();
      });
    });
  });

  beforeEach(() => {
    mapView.ui = {
      add: jasmine.createSpy('mapView.ui.add')
    };
    mapView.goTo = jasmine.createSpy('mapView.goTo');
  });

  describe('setSearchWidget(opts)', () => {
    var widgetOpts;

    beforeEach(() => {
      widgetOpts = {
        startup: jasmine.createSpy('searchWidget.startup'),
        on: jasmine.createSpy('searchWidget.on')
      };
    });
    
    afterEach(() => {
      scope.$digest();
    });

    it('should fail if view is undefined', () => {
      EsriMap.setSearchWidget(widgetOpts).then(res => {
        expect(res).toBeUndefined();
      }, res => {
        expect(res).toBeDefined();
      });
    });

    it('should create new Search Widget and attach to view if container is not specified', () => {
      widgetOpts.view = mapView;
      EsriMap.setSearchWidget(widgetOpts).then(res => {
        expect(res).toBeDefined();
        expect(res.startup).toHaveBeenCalled();
        expect(res.on).toHaveBeenCalled();
        expect(res.view.ui.add).toHaveBeenCalled();
      });
    });  

    it('should create new Search Widget and attach to the specified container', () => {
      widgetOpts.container = 'widgetDiv';
      EsriMap.setSearchWidget(widgetOpts).then(res => {
        expect(res).toBeDefined();
        expect(res.startup).toHaveBeenCalled();
        expect(res.on).toHaveBeenCalled();
        expect(res.view.ui.add).not.toHaveBeenCalled();
      });
    });

  });

  describe('setLocateWidget(opts)', () => {
    var widgetOpts;

    beforeEach(() => {
      widgetOpts = {
        startup: jasmine.createSpy('locateWidget.startup'),
        on: jasmine.createSpy('locateWidget.on')
      };
    });
    
    afterEach(() => {
      scope.$digest();
    });

    it('should fail if view is undefined', () => {
      EsriMap.setLocateWidget(widgetOpts).then(() => {
      }, res => {
        expect(res).toBeDefined();
      });
    });

    it('should create new Locate Widget and attach to view if container is not specified', () => {
      widgetOpts.view = mapView;
      EsriMap.setLocateWidget(widgetOpts).then(res => {
        expect(res).toBeDefined();
        expect(res.startup).toHaveBeenCalled();
        expect(res.on).toHaveBeenCalled();
        expect(res.view.ui.add).toHaveBeenCalled();
      });
    });  

    it('should create new Locate Widget and attach to the specified container', () => {
      widgetOpts.container = 'widgetDiv';
      EsriMap.setLocateWidget(widgetOpts).then(res => {
        expect(res).toBeDefined();
        expect(res.startup).toHaveBeenCalled();
        expect(res.on).toHaveBeenCalled();
        expect(res.view.ui.add).not.toHaveBeenCalled();
      });
    });

  });

  describe('zoomToLocation(opts)', () => {
    var opts;
    var mapLocator;

    beforeEach(() => {
      opts = {
        view: mapView,
        coordinates: {
          longitude: 0.0,
          latitude: 0.0
        }
      };

      mapLocator.locationToAddress = jasmine.createSpy('mapLocator.locationToAddress');
    });

    afterEach(() => {
      scope.$digest();
    });

    it('should call MapView.goTo', () => {
      EsriMap.zoomToLocation(opts);
      expect(opts.view.goTo).toHaveBeenCalled();
    });

    it('should set zoom to 8 if it is not defined', () => {
      expect(opts.zoom).toBeUndefined();
      EsriMap.zoomToLocation(opts);
      expect(opts.zoom).toBe(8);
    });
  });

  describe('moveToCurrentPosition(view)', () => {
    var coords = {
      longitude: 0.0,
      latitude: 0.0
    };

    it('should fail if MapView is undefined', () => {

    });
  });

});
