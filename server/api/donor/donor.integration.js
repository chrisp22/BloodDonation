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
    beforeEach(function(done) {
      request(app)
        .post('/api/donors')
        .send({
          name: 'New Donor',
          info: 'This is the brand new donor!!!'
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
      newDonor.name.should.equal('New Donor');
      newDonor.info.should.equal('This is the brand new donor!!!');
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
      donor.name.should.equal('New Donor');
      donor.info.should.equal('This is the brand new donor!!!');
    });

  });

  describe('PUT /api/donors/:id', function() {
    var updatedDonor;

    beforeEach(function(done) {
      request(app)
        .put('/api/donors/' + newDonor._id)
        .send({
          name: 'Updated Donor',
          info: 'This is the updated donor!!!'
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
      updatedDonor.name.should.equal('Updated Donor');
      updatedDonor.info.should.equal('This is the updated donor!!!');
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
