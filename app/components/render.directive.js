(function() {
    'use strict';

    angular
        .module('app')
        .directive('renderDirective', renderDirective);

    renderDirective.$inject = ['ButtonService', 'Styles'];

    function renderDirective(ButtonService, Styles) {

        return  {
            restrict: 'A',
            link: link
        };


        function link($scope, element, attrs) {

            $scope.buttons = ButtonService.getAll();

            $scope.$watch('buttons', function() {
                var styles = Styles.compile().getStyles();
                onRender(styles);
            }, true);

            function onRender(styles) {
                element.text(styles);
                angular.element(document.getElementById('dynamic-css')).text(styles);
            }
        }
    }
})();