'use strict';

angular.module('bloodDonationApp')
  .directive('esriSearch', function () {
    return {
      restrict: 'E',
      scope: {
        view: '=',
        searchOptions: '&'
      },
      controllerAs: 'searchCtrl',
      bindToController: true,
      controller: 'EsriSearchCtrl',
      link: function (scope, element, attrs, controller) {
        scope.$watch('searchCtrl.view', (newView) => {
          controller.initWidget(newView);
        });

        scope.$on('$destroy', () => {
          console.log("destroy");
          controller.destroyWidget();
        });
      }
    };
  });
