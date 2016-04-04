(function() {
    'use strict';

    angular
        .module('app')
        .factory('Styles', Styles);

    Styles.$inject = ['ButtonService', 'groupRulesDeps'];

    function Styles(ButtonService, groupRulesDeps) {

        var tab = '    ',
            units = 'px',
            styles = '',
            separator = '_',
            _buttons = [],
            _mainButtonRules = {};

        return {
            compile: compile,
            getStyles: getStyles
        };


        /**
         * Compile all buttons CSS
         * @returns {Styles.compile}
         */
        function compile() {
            var options = ButtonService.getOptions();
            var buttonClass = options.className;

            _buttons = ButtonService.getAll();

            if (!!_buttons[0]) {
                _mainButtonRules = {};

                separator = options.separator;

                // Clean old styles
                styles = '/* Button Component styles */\n';

                angular.forEach(_buttons, function(button) {
                    var buttonCopy = angular.copy(button);
                    for (var section in buttonCopy) {
                        if (buttonCopy.hasOwnProperty(section) && section != 'modifier' && !!button[section]) {
                            _compileSilentBtn(button, section, buttonClass);
                            _mainButtonRules = _buttons[0].common.rules;
                        }
                    }
                });
            }

            return this;
        }

        function _compileSilentBtn(button, section, buttonClass) {
            var renderGroup = new Render(button[section].rules, section);
            var className = !!button.modifier ? buttonClass+separator+button.modifier : buttonClass;
            var hasBorder = button[section].groupRules.indexOf('border') >= 0;

            openSelector(className, section);

            if (!button.modifier && section == 'common') {
                setCommon(hasBorder);
            }

            angular.forEach(button[section].groupRules, function(group) {
                renderGroup[group]();
            });

            closeSelector();
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
        function setCommon(hasBorder) {
            styles += tab + 'box-sizing: border-box;\n';
            styles += tab + 'display: inline-block;\n';
            styles += tab + 'cursor: pointer;\n';
            styles += tab + 'outline: none;\n';
            styles += tab + 'text-decoration: none;\n';
            styles += tab + '-webkit-transition: all 0.25s;\n';
            styles += tab + 'transition: all 0.25s;\n';
            styles += tab + 'font-family: "Open Sans", sans-serif;\n';
            styles += tab + 'margin: 0;\n';

            if (!hasBorder) {
                styles += tab + 'border: none;\n';
            }
        }

        function openSelector(className, section) {
            var classNameRender = (section == 'common') ? className : className+':'+section;
            styles += '.' + classNameRender + ' {\n';
        }

        function closeSelector() {
            styles += '}\n';
        }

        function isChanged(rules, key) {
            return rules[key] !== _mainButtonRules[key];
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
                if (!!rules['height'] && isChanged(rules, 'height')) {
                    var line_height = (!!rules['border']) ? rules['height'] - rules['border'] * 2 : rules['height'];

                    styles += tab + 'height: ' + rules['height'] + units + ';\n';
                    styles += tab + 'line-height: ' + line_height + units + ';\n';


                }
                if (!!rules['padding'] && isChanged(rules, 'padding')) {
                    rules['padding-right'] = rules['padding-left'] = rules['padding'];
                    styles += tab + 'padding: ' + rules['padding-top'] + units + ' ' + rules['padding-right'] + units + ' ' + rules['padding-bottom'] + units + ' ' + rules['padding-left'] + units + ';\n';
                }
            };

            render.fill = function() {
                if (!!rules['background'] && rules['background'] !== _mainButtonRules['background']) {
                    styles += tab + 'background: ' + rules['background'] + ';\n';
                }
            };

            render.border = function() {
                if (!!rules['border']
                    && rules['border'] != 0
                    && (rules['border'] !== _mainButtonRules['border']
                        || rules['border-color'] !== _mainButtonRules['border-color']))
                {
                    styles += tab + 'border: ' + rules['border'] + units + ' solid ' + rules['border-color'] + ';\n';
                } else if (role == 'common') {
                    styles += tab + 'border: none;\n';
                }
            };

            render.font = function() {
                if (!!rules['font-size'] && rules['font-size'] !== _mainButtonRules['font-size']) {
                    styles += tab + 'font-size: ' + rules['font-size'] + units + ';\n';
                }
                if (!!rules['color'] && rules['color'] !== _mainButtonRules['color']) {
                    styles += tab + 'color: ' + rules['color'] + ';\n';
                }
                if (!!rules['font-weight'] && rules['font-weight'] !== _mainButtonRules['font-weight']) {
                    styles += tab + 'font-weight: ' + rules['font-weight'] + ';\n';
                }
                if (!!rules['font-style'] && rules['font-style'] !== _mainButtonRules['font-style']) {
                    styles += tab + 'font-style: ' + rules['font-style'] + ';\n';
                }
                if (!!rules['text-transform'] && rules['text-transform'] !== _mainButtonRules['text-transform']) {
                    styles += tab + 'text-transform: ' + rules['text-transform'] + ';\n';
                }
            };
            render.radius = function() {
                if (!!rules['border-radius'] && rules['border-radius'] !== _mainButtonRules['border-radius']) {
                    styles += tab + 'border-radius: ' + rules['border-radius'] + units + ';\n';
                }
            };
            render.shadow = function() {
                if (!!rules['box-shadow-color'] && !!rules['box-shadow-blur'])
                {
                    var old_box_shadow = _mainButtonRules['box-shadow-x'] + units + ' ' + _mainButtonRules['box-shadow-y'] + units + ' ' + _mainButtonRules['box-shadow-blur'] + units + ' ' + _mainButtonRules['box-shadow-color'];
                    var box_shadow = rules['box-shadow-x'] + units + ' ' + rules['box-shadow-y'] + units + ' ' + rules['box-shadow-blur'] + units + ' ' + rules['box-shadow-color'];

                    if (box_shadow !== old_box_shadow) {
                        styles += tab + '-webkit-box-shadow: ' + box_shadow + ';\n';
                        styles += tab + '-moz-box-shadow: ' + box_shadow + ';\n';
                        styles += tab + 'box-shadow: ' + box_shadow + ';\n';
                    }
                }
            };

            return render;
        }
    }


})();