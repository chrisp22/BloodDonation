'use strict';

describe('Directive: esriSearch', function () {

  // load the directive's module and view
  beforeEach(module('bloodDonationApp'));
  beforeEach(module('components/esri-search/esri-search.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<esri-search></esri-search>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the esriSearch directive');
  }));
});
