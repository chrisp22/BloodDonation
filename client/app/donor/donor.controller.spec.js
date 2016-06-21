'use strict';

describe('Component: DonorComponent', function () {

  // load the controller's module
  beforeEach(module('bloodDonationApp'));

  var DonorComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    DonorComponent = $componentController('DonorComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
