(function() {
    'use strict';

    angular
        .module('app')
        .directive('renderDirective', renderDirective);

    renderDirective.$inject = ['Button', 'Styles'];

    function renderDirective(Button, Styles) {

        return  {
            restrict: 'A',
            link: link
        };


        function link($scope, element, attrs) {

            $scope.buttons = Button.getAll();

            $scope.$watch('buttons', function() {
                var styles = Styles.compile().getStyles();
                onRender(styles);
            }, true);

            //console.log(buildService);



            function buildCSS(buttons) {
                var styles = '';

                angular.forEach(buttons, function(button, key) {
                    styles += buildOneElement(button);
                });


            }

            function buildOneElement(button) {
                var styles = '',
                    className = button.role == 'common' ? button.classname : button.classname+':'+button.role;

                styles += '.' + className + ' {\n';

                if (button.role == 'common') {
                    buildService.setCommon();
                }

                // Size
                buildService.setSize(button.rules);



                // Fill
                if (button.rules.background) {
                    styles += tab + 'background: ' + button.rules.background + ';\n';
                }

                styles += '}\n';

                return styles;
            }

            function onRender(styles) {
                element.text(styles);
                angular.element(document.getElementById('dynamic-css')).text(styles);
            }
        }
    }
})();