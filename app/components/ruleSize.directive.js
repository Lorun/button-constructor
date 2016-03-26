(function() {
    'use strict';

    angular
        .module('app')
        .directive('renderDirective', renderDirective);

    renderDirective.$inject = ['dataService'];

    function renderDirective(dataService) {

        var directive =  {
            restrict: 'A',
            link: link
        };
        return directive;

        function link($scope, element, attrs) {

            $scope.buttons = dataService.getButtons();

            $scope.$watch('buttons', function() {

            }, true);
        }
    }
})();