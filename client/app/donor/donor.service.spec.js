'use strict';

describe('Service: Donors', function () {

  // load the service's module
  beforeEach(module('bloodDonationApp'));

  // instantiate service
  var Donors;
  var httpBackend;

  beforeEach(inject(function (_Donors_, $httpBackend) {
    Donors = _Donors_;
    httpBackend = $httpBackend;
  }));

  

  describe('HTTP calls', function() {
    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    var locSearchParam = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [0.0, 0.0]
          },
          $maxDistance: 1000
        }
      }
    };

    it('should call the API', function() {
      httpBackend.expectGET(/api\/donors\?query=.*/).respond('');
      Donors.getWithinBox();
      httpBackend.flush();
    });

  });

  var donor;
  var status;

  describe('Donor.get(donorId)', function() {

    it('should return the donor with matching donorId', function() {
      httpBackend.whenGET('/api/donors/abc123').respond(200, { _id: 'abc123' });
      Donors.get('abc123').then(res => donor = res.data);
      httpBackend.flush();

      expect(donor._id).toEqual('abc123');
    });
  });

  describe('Donor.create(donor)', function() {
    var newDonor = {
      email: 'sample@email.com',
      firstName: 'John'
    };
    it('should post donor', function() {
      httpBackend.whenPOST('/api/donors', newDonor).respond(200, { _id: 'abc123', email: newDonor.email, firstName: newDonor.firstName });
      Donors.create(newDonor).then(res => donor = res.data);
      httpBackend.flush();

      expect(donor._id).toEqual('abc123');
      expect(donor.email).toEqual(newDonor.email);
      expect(donor.firstName).toEqual(newDonor.firstName);
    });
  });

  describe('Donor.update(donor)', function() {
    var modDonor = {
      _id: '123abc',
      email: 'sample@email.com',
      firstName: 'Jane'
    };

    it('should update donor', function() {
      httpBackend.whenPUT('/api/donors/' + modDonor._id, modDonor).respond(200, modDonor);
      Donors.update(modDonor).then(res => donor = res.data);
      httpBackend.flush();
      
      expect(donor._id).toEqual(modDonor._id);
      expect(donor.email).toEqual(modDonor.email);
      expect(donor.firstName).toEqual(modDonor.firstName);
    });

    it('should return an error if id does not exist', function() {
      httpBackend.whenPUT('/api/donors/' + modDonor._id, modDonor).respond(400);
      Donors.update(modDonor).then(res => donor = res.data, res => status = res.status);
      httpBackend.flush();
      
      expect(status).toEqual(400);
    });
  });

  describe('Donor.remove(donorId)', function() {
    it('should remove the donor with matching donorId', function() {
      httpBackend.whenDELETE('/api/donors/' + donor._id).respond(204);
      Donors.remove(donor._id).then(res => status = res.status);
      httpBackend.flush();
      
      expect(status).toEqual(204);
    });
  });

});
