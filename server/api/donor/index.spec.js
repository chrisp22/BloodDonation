'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var donorCtrlStub = {
  index: 'donorCtrl.index',
  show: 'donorCtrl.show',
  create: 'donorCtrl.create',
  update: 'donorCtrl.update',
  destroy: 'donorCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var donorIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './donor.controller': donorCtrlStub
});

describe('Donor API Router:', function() {

  it('should return an express router instance', function() {
    donorIndex.should.equal(routerStub);
  });

  describe('GET /api/donors', function() {

    it('should route to donor.controller.index', function() {
      routerStub.get
        .withArgs('/', 'donorCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/donors/:id', function() {

    it('should route to donor.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'donorCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/donors', function() {

    it('should route to donor.controller.create', function() {
      routerStub.post
        .withArgs('/', 'donorCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/donors/:id', function() {

    it('should route to donor.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'donorCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/donors/:id', function() {

    it('should route to donor.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'donorCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/donors/:id', function() {

    it('should route to donor.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'donorCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
