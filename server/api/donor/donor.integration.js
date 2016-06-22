'use strict';

var app = require('../..');
import request from 'supertest';

var newDonor;

describe('Donor API:', function() {

  describe('GET /api/donors', function() {
    var donors;

    beforeEach(function(done) {
      request(app)
        .get('/api/donors')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          donors = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      donors.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/donors', function() {
    before(function(done) {
      request(app)
        .post('/api/donors')
        .send({
          firstName : 'John',
          lastName : 'Doe',
          email : 'jdoe@email.com',
          contactNum : '+999999999999',
          bloodGroup : 'A',
          address : 'Some, Place',
          location : {
            type: 'Point',
            coordinates: [0.0, 0.0]
          }
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newDonor = res.body;
          done();
        });
    });

    it('should respond with the newly created donor', function() {
      newDonor.firstName.should.equal('John');
      newDonor.lastName.should.equal('Doe');
      newDonor.email.should.equal('jdoe@email.com');
      newDonor.contactNum.should.equal('+999999999999');
      newDonor.bloodGroup.should.equal('A');
      newDonor.address.should.equal('Some, Place');
      newDonor.location.type.should.equal('Point');
      newDonor.location.coordinates[0].should.equal(0.0);
      newDonor.location.coordinates[1].should.equal(0.0);
    });

    it('should return error trying to save empty object', function() {
      request(app)
        .post('/api/donors')
        .send({})
        .expect(500)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should return error trying to save duplicate email', function() {
      request(app)
        .post('/api/donors')
        .send(newDonor)
        .expect(422)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('GET /api/donors/:id', function() {
    var donor;

    beforeEach(function(done) {
      request(app)
        .get('/api/donors/' + newDonor._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          donor = res.body;
          done();
        });
    });

    afterEach(function() {
      donor = {};
    });

    it('should respond with the requested donor', function() {
      donor.firstName.should.equal('John');
      donor.lastName.should.equal('Doe');
      donor.email.should.equal('jdoe@email.com');
      donor.contactNum.should.equal('+999999999999');
      donor.bloodGroup.should.equal('A');
      donor.address.should.equal('Some, Place');
      donor.location.type.should.equal('Point');
      donor.location.coordinates[0].should.equal(0.0);
      donor.location.coordinates[1].should.equal(0.0);
    });

  });

  describe('PUT /api/donors/:id', function() {
    var updatedDonor;

    beforeEach(function(done) {
      request(app)
        .put('/api/donors/' + newDonor._id)
        .send({
          firstName : 'Jane',
          lastName : 'Doe',
          email : 'jdoe@email.com',
          contactNum : '+444444444444',
          bloodGroup : 'A',
          address : 'Some, Place',
          location : {
            type: 'Point',
            coordinates: [180.0, 45.0]
          }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedDonor = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedDonor = {};
    });

    it('should respond with the updated donor', function() {
      updatedDonor.firstName.should.equal('Jane');
      updatedDonor.lastName.should.equal('Doe');
      updatedDonor.email.should.equal('jdoe@email.com');
      updatedDonor.contactNum.should.equal('+444444444444');
      updatedDonor.bloodGroup.should.equal('A');
      updatedDonor.address.should.equal('Some, Place');
      updatedDonor.location.type.should.equal('Point');
      updatedDonor.location.coordinates[0].should.equal(180.0);
      updatedDonor.location.coordinates[1].should.equal(45.0);
    });

  });

  describe('DELETE /api/donors/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/donors/' + newDonor._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when donor does not exist', function(done) {
      request(app)
        .delete('/api/donors/' + newDonor._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
