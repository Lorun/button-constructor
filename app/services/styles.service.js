(function() {
    'use strict';

    angular
        .module('app')
        .factory('Styles', Styles);

    Styles.$inject = ['ButtonService', 'groupRulesDeps'];

    function Styles(ButtonService, groupRulesDeps) {

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
            var buttons = ButtonService.getAll();

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
            styles += tab + 'text-decoration: none;\n';
            styles += tab + '-webkit-transition: all 0.25s;\n';
            styles += tab + 'transition: all 0.25s;\n';
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
            var render = {};

            render.size = function() {
                if (rules['height'] !== undefined) {
                    var line_height = (rules['border'] !== undefined) ? rules['height'] - rules['border'] * 2 : rules['height'];

                    styles += tab + 'height: ' + rules.height + units + ';\n';
                    styles += tab + 'line-height: ' + line_height + units + ';\n';

                    if (rules['padding'] !== undefined) {
                        rules['padding-right'] = rules['padding-left'] = rules['padding'];
                    }
                    styles += tab + 'padding: ' + rules['padding-top'] + units + ' ' + rules['padding-right'] + units + ' ' + rules['padding-bottom'] + units + ' ' + rules['padding-left'] + units + ';\n';
                }
            };

            render.fill = function() {
                if (rules['background'] !== undefined) {
                    styles += tab + 'background: ' + rules['background'] + ';\n';
                }
            };

            render.border = function() {
                if (rules['border'] !== undefined && rules['border'] != 0 ) {
                    styles += tab + 'border: ' + rules['border'] + units + ' solid ' + rules['border-color'] + ';\n';
                } else if (role == 'common') {
                    styles += tab + 'border: none;\n';
                }
            };

            render.font = function() {
                if (rules['font-size'] !== undefined && rules['color'] !== undefined ) {
                    styles += tab + 'font-size: ' + rules['font-size'] + units + ';\n';
                    styles += tab + 'color: ' + rules['color'] + ';\n';
                }
                if (rules['font-weight'] !== undefined) {
                    styles += tab + 'font-weight: ' + rules['font-weight'] + ';\n';
                }
                if (rules['font-style'] !== undefined) {
                    styles += tab + 'font-style: ' + rules['font-style'] + ';\n';
                }
                if (rules['text-transform'] !== undefined) {
                    styles += tab + 'text-transform: ' + rules['text-transform'] + ';\n';
                }
            };
            render.radius = function() {
                if (rules['border-radius'] !== undefined) {
                    styles += tab + 'border-radius: ' + rules['border-radius'] + units + ';\n';
                }
            };
            render.shadow = function() {};

            return render;
        }
    }


})();