(function() {
    'use strict';

    angular
        .module('app')
        .factory('Styles', Styles);

    Styles.$inject = ['Button', 'groupRulesDeps'];

    function Styles(Button, groupRulesDeps) {

        var tab = '    ',
            units = 'px',
            styles;

        return {
            compile: compile,
            getStyles: getStyles
        };


        /**
         * Compile all buttons CSS
         * @returns {Styles.compile}
         */
        function compile() {
            var buttons = Button.getAll();

            // Clean old styles
            styles = '';

            angular.forEach(buttons, function(button) {
                var renderGroup = new Render(button.rules, button.role);

                openSelector(button.classname, button.role);

                if (button.role == 'common') {
                    setCommon();
                }

                angular.forEach(groupRulesDeps, function(styles, group) {
                    renderGroup[group]();
                });

                closeSelector();
            });

            return this;
        }

        /**
         * Get compiled CSS
         * @returns {*}
         */
        function getStyles() {
            return styles;
        }

        /**
         * Set common styles for general Button
         */
        function setCommon() {
            styles += tab + 'box-sizing: border-box;\n';
            styles += tab + 'display: inline-block;\n';
            styles += tab + 'cursor: pointer;\n';
            styles += tab + 'outline: none;\n';
        }

        function openSelector(className, role) {
            var classNameRender = (role == 'common' || role == 'inherit') ? className : className+':'+role;
            styles += '.' + classNameRender + ' {\n';
        }

        function closeSelector() {
            styles += '}\n';
        }


        /**
         * Renderer styles by rules group
         * @param rules
         * @param role
         * @constructor
         */
        function Render(rules, role) {

            this.size = function() {
                if (rules['height'] !== undefined) {
                    var line_height = (rules['border'] !== undefined) ? rules['line-height'] - rules['border'] * 2 : rules['line-height'];

                    styles += tab + 'height: ' + rules.height + units + ';\n';
                    styles += tab + 'line-height: ' + line_height + units + ';\n';

                    if (rules['padding'] !== undefined) {
                        rules['padding-right'] = rules['padding-left'] = rules['padding'];
                    }
                    styles += tab + 'padding: ' + rules['padding-top'] + units + ' ' + rules['padding-right'] + units + ' ' + rules['padding-bottom'] + units + ' ' + rules['padding-left'] + units + ';\n';
                }
            };

            this.fill = function() {
                if (rules['background'] !== undefined) {
                    styles += tab + 'background: ' + rules['background'] + ';\n';
                }
            };

            this.border = function() {
                if (rules['border'] !== undefined && rules['border'] != 0 ) {
                    styles += tab + 'border: ' + rules['border'] + units + ' solid ' + rules['border-color'] + ';\n';
                } else if (role == 'common') {
                    styles += tab + 'border: none;\n';
                }
            };

            this.font = function() {};
            this.uppercase = function() {};
            this.radius = function() {};
            this.shadow = function() {};
        }
    }


})();