'use strict';

describe('Service: Donors', function () {

  // load the service's module
  beforeEach(module('bloodDonationApp'));

  // instantiate service
  var Donors;
  beforeEach(inject(function (_Donors_) {
    Donors = _Donors_;
  }));

  it('should do something', function () {
    expect(!!Donors).toBe(true);
  });

});
