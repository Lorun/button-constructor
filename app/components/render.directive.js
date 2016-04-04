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
            var codeTextarea = element.find('textarea');

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
                element.find('pre').text(styles);
                codeTextarea.val(styles);
                angular.element(document.getElementById('dynamic-css')).text(styles.replace(/[\.]([a-zA-Z])/g, '.g-preview-list .$1'));
            }
        }
    }
})();