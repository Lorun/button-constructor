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


        function link($scope, element) {

            $scope.buttons = ButtonService.getAll();
            $scope.options = ButtonService.getOptions();

            $scope.$watch('buttons', function() {
                onChange();
            }, true);

            $scope.$watch('options', function() {
                onChange();
            }, true);

            function onChange() {
                var styles = Styles.compile().getStyles();
                element.text(styles);
                angular.element(document.getElementById('dynamic-css')).text(styles.replace(/[\.]([a-zA-Z])/g, '.g-preview-list .$1'));
            }
        }
    }
})();