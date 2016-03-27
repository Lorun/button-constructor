/*! 
 * button-constructor v0.0.1
 * https://Lorun.github.io/button-constructor
 * Copyright (c) 2016 Lorun
 * License: MIT
 */
(function() {
    'use strict';

    angular
        .module('app', ['colorpicker.module'])
        .constant('defaultRules', {
            'height'            : 40,
            'line-height'       : 40,
            'padding'           : 20,
            'padding-left'      : 20,
            'padding-right'     : 20,
            'padding-top'       : 0,
            'padding-bottom'    : 0,
            'background'        : '#4980b7',
            'border-color'      : '#2f4255',
            'border'            : 1,
            'font-size'         : 14,
            'color'             : '#fff',
            'font-weight'       : 'normal',
            'border-radius'     : 4,
            'box-shadow-color'  : 'rgba(0,0,0,0.2)',
            'box-shadow-x'      : 0,
            'box-shadow-y'      : 1,
            'box-shadow-blur'   : 4
        })
        .constant('groupRulesDeps', {
            'size'      : ['height', 'line-height', 'padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom'],
            'fill'      : ['background'],
            'font'      : ['font-size', 'color', 'font-weight', 'font-style', 'text-transform'],
            'border'    : ['border', 'border-color'],
            'radius'    : ['border-radius'],
            'shadow'    : ['box-shadow-color', 'box-shadow-x', 'box-shadow-y', 'box-shadow-blur']
        })
        .run(['ButtonService', function(ButtonService) {
            ButtonService.loadJSON('default');
        }]);
})();
(function() {
    'use strict';

    angular.module('colorpicker.module', [])
        .factory('Helper', function () {
            'use strict';
            return {
                closestSlider: function (elem) {
                    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
                    if (matchesSelector.bind(elem)('I')) {
                        return elem.parentNode;
                    }
                    return elem;
                },
                getOffset: function (elem, fixedPosition) {
                    var
                        scrollX = 0,
                        scrollY = 0,
                        rect = elem.getBoundingClientRect();
                    while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
                        if (!fixedPosition && elem.tagName === 'BODY') {
                            scrollX += document.documentElement.scrollLeft || elem.scrollLeft;
                            scrollY += document.documentElement.scrollTop || elem.scrollTop;
                        } else {
                            scrollX += elem.scrollLeft;
                            scrollY += elem.scrollTop;
                        }
                        elem = elem.offsetParent;
                    }
                    return {
                        top: rect.top + window.pageYOffset,
                        left: rect.left + window.pageXOffset,
                        scrollX: scrollX,
                        scrollY: scrollY
                    };
                },
                // a set of RE's that can match strings and generate color tuples. https://github.com/jquery/jquery-color/
                stringParsers: [
                    {
                        re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                        parse: function (execResult) {
                            return [
                                execResult[1],
                                execResult[2],
                                execResult[3],
                                execResult[4]
                            ];
                        }
                    },
                    {
                        re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                        parse: function (execResult) {
                            return [
                                2.55 * execResult[1],
                                2.55 * execResult[2],
                                2.55 * execResult[3],
                                execResult[4]
                            ];
                        }
                    },
                    {
                        re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
                        parse: function (execResult) {
                            return [
                                parseInt(execResult[1], 16),
                                parseInt(execResult[2], 16),
                                parseInt(execResult[3], 16)
                            ];
                        }
                    },
                    {
                        re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
                        parse: function (execResult) {
                            return [
                                parseInt(execResult[1] + execResult[1], 16),
                                parseInt(execResult[2] + execResult[2], 16),
                                parseInt(execResult[3] + execResult[3], 16)
                            ];
                        }
                    }
                ]
            };
        })
        .factory('Color', ['Helper', function (Helper) {
            'use strict';
            return {
                value: {
                    h: 1,
                    s: 1,
                    b: 1,
                    a: 1
                },
                // translate a format from Color object to a string
                'rgb': function () {
                    var rgb = this.toRGB();
                    return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
                },
                'rgba': function () {
                    var rgb = this.toRGB();
                    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';
                },
                'hex': function () {
                    return  this.toHex();
                },

                // HSBtoRGB from RaphaelJS
                RGBtoHSB: function (r, g, b, a) {
                    r /= 255;
                    g /= 255;
                    b /= 255;

                    var H, S, V, C;
                    V = Math.max(r, g, b);
                    C = V - Math.min(r, g, b);
                    H = (C === 0 ? null :
                        V === r ? (g - b) / C :
                            V === g ? (b - r) / C + 2 :
                            (r - g) / C + 4
                    );
                    H = ((H + 360) % 6) * 60 / 360;
                    S = C === 0 ? 0 : C / V;
                    return {h: H || 1, s: S, b: V, a: a || 1};
                },

                //parse a string to HSB
                setColor: function (val) {
                    val = (val) ? val.toLowerCase() : val;
                    for (var key in Helper.stringParsers) {
                        if (Helper.stringParsers.hasOwnProperty(key)) {
                            var parser = Helper.stringParsers[key];
                            var match = parser.re.exec(val),
                                values = match && parser.parse(match);
                            if (values) {
                                this.value = this.RGBtoHSB.apply(null, values);
                                return false;
                            }
                        }
                    }
                },

                setHue: function (h) {
                    this.value.h = 1 - h;
                },

                setSaturation: function (s) {
                    this.value.s = s;
                },

                setLightness: function (b) {
                    this.value.b = 1 - b;
                },

                setAlpha: function (a) {
                    this.value.a = parseInt((1 - a) * 100, 10) / 100;
                },

                // HSBtoRGB from RaphaelJS
                // https://github.com/DmitryBaranovskiy/raphael/
                toRGB: function (h, s, b, a) {
                    if (!h) {
                        h = this.value.h;
                        s = this.value.s;
                        b = this.value.b;
                    }
                    h *= 360;
                    var R, G, B, X, C;
                    h = (h % 360) / 60;
                    C = b * s;
                    X = C * (1 - Math.abs(h % 2 - 1));
                    R = G = B = b - C;

                    h = ~~h;
                    R += [C, X, 0, 0, X, C][h];
                    G += [X, C, C, X, 0, 0][h];
                    B += [0, 0, X, C, C, X][h];
                    return {
                        r: Math.round(R * 255),
                        g: Math.round(G * 255),
                        b: Math.round(B * 255),
                        a: a || this.value.a
                    };
                },

                toHex: function (h, s, b, a) {
                    var rgb = this.toRGB(h, s, b, a);
                    return '#' + ((1 << 24) | (parseInt(rgb.r, 10) << 16) | (parseInt(rgb.g, 10) << 8) | parseInt(rgb.b, 10)).toString(16).substr(1);
                }
            };
        }])
        .factory('Slider', ['Helper', function (Helper) {
            'use strict';
            var
                slider = {
                    maxLeft: 0,
                    maxTop: 0,
                    callLeft: null,
                    callTop: null,
                    knob: {
                        top: 0,
                        left: 0
                    }
                },
                pointer = {};

            return {
                getSlider: function() {
                    return slider;
                },
                getLeftPosition: function(event) {
                    return Math.max(0, Math.min(slider.maxLeft, slider.left + ((event.pageX || pointer.left) - pointer.left)));
                },
                getTopPosition: function(event) {
                    return Math.max(0, Math.min(slider.maxTop, slider.top + ((event.pageY || pointer.top) - pointer.top)));
                },
                setSlider: function (event, fixedPosition) {
                    var
                        target = Helper.closestSlider(event.target),
                        targetOffset = Helper.getOffset(target, fixedPosition),
                        rect = target.getBoundingClientRect(),
                        offsetX = event.clientX - rect.left,
                        offsetY = event.clientY - rect.top;

                    slider.knob = target.children[0].style;
                    slider.left = event.pageX - targetOffset.left - window.pageXOffset + targetOffset.scrollX;
                    slider.top = event.pageY - targetOffset.top - window.pageYOffset + targetOffset.scrollY;

                    pointer = {
                        left: event.pageX - (offsetX - slider.left),
                        top: event.pageY - (offsetY - slider.top)
                    };
                },
                setSaturation: function(event, fixedPosition, componentSize) {
                    slider = {
                        maxLeft: componentSize,
                        maxTop: componentSize,
                        callLeft: 'setSaturation',
                        callTop: 'setLightness'
                    };
                    this.setSlider(event, fixedPosition);
                },
                setHue: function(event, fixedPosition, componentSize) {
                    slider = {
                        maxLeft: 0,
                        maxTop: componentSize,
                        callLeft: false,
                        callTop: 'setHue'
                    };
                    this.setSlider(event, fixedPosition);
                },
                setAlpha: function(event, fixedPosition, componentSize) {
                    slider = {
                        maxLeft: 0,
                        maxTop: componentSize,
                        callLeft: false,
                        callTop: 'setAlpha'
                    };
                    this.setSlider(event, fixedPosition);
                },
                setKnob: function(top, left) {
                    slider.knob.top = top + 'px';
                    slider.knob.left = left + 'px';
                }
            };
        }])
        .directive('colorpicker', ['$document', '$compile', 'Color', 'Slider', 'Helper', function ($document, $compile, Color, Slider, Helper) {
            'use strict';
            return {
                require: '?ngModel',
                restrict: 'A',
                link: function ($scope, elem, attrs, ngModel) {
                    var
                        thisFormat = attrs.colorpicker ? attrs.colorpicker : 'hex',
                        position = angular.isDefined(attrs.colorpickerPosition) ? attrs.colorpickerPosition : 'bottom',
                        inline = angular.isDefined(attrs.colorpickerInline) ? attrs.colorpickerInline : false,
                        fixedPosition = angular.isDefined(attrs.colorpickerFixedPosition) ? attrs.colorpickerFixedPosition : false,
                        target = angular.isDefined(attrs.colorpickerParent) ? elem.parent() : angular.element(document.body),
                        withInput = angular.isDefined(attrs.colorpickerWithInput) ? attrs.colorpickerWithInput : false,
                        componentSize = angular.isDefined(attrs.colorpickerSize) ? attrs.colorpickerSize : 100,
                        componentSizePx = componentSize + 'px',
                        inputTemplate = withInput ? '<input type="text" name="colorpicker-input" spellcheck="false">' : '',
                        closeButton = !inline ? '<button type="button" class="close close-colorpicker">&times;</button>' : '',
                        template =
                            '<div class="colorpicker dropdown">' +
                            '<div class="dropdown-menu">' +
                            '<colorpicker-saturation><i></i></colorpicker-saturation>' +
                            '<colorpicker-hue><i></i></colorpicker-hue>' +
                            '<colorpicker-alpha><i></i></colorpicker-alpha>' +
                            '<colorpicker-preview></colorpicker-preview>' +
                            inputTemplate +
                            closeButton +
                            '</div>' +
                            '</div>',
                        colorpickerTemplate = angular.element(template),
                        pickerColor = Color,
                        componentSizePx,
                        sliderAlpha,
                        sliderHue = colorpickerTemplate.find('colorpicker-hue'),
                        sliderSaturation = colorpickerTemplate.find('colorpicker-saturation'),
                        colorpickerPreview = colorpickerTemplate.find('colorpicker-preview'),
                        pickerColorPointers = colorpickerTemplate.find('i');

                    $compile(colorpickerTemplate)($scope);
                    colorpickerTemplate.css('min-width', parseInt(componentSize) + 29 + 'px');
                    sliderSaturation.css({
                        'width' : componentSizePx,
                        'height' : componentSizePx
                    });
                    sliderHue.css('height', componentSizePx);

                    if (withInput) {
                        var pickerColorInput = colorpickerTemplate.find('input');
                        pickerColorInput.css('width', componentSizePx);
                        pickerColorInput
                            .on('mousedown', function(event) {
                                event.stopPropagation();
                            })
                            .on('keyup', function() {
                                var newColor = this.value;
                                elem.val(newColor);
                                if (ngModel && ngModel.$modelValue !== newColor) {
                                    $scope.$apply(ngModel.$setViewValue(newColor));
                                    update(true);
                                }
                            });
                    }

                    function bindMouseEvents() {
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);
                    }

                    if (thisFormat === 'rgba') {
                        colorpickerTemplate.addClass('alpha');
                        sliderAlpha = colorpickerTemplate.find('colorpicker-alpha');
                        sliderAlpha.css('height', componentSizePx);
                        sliderAlpha
                            .on('click', function(event) {
                                Slider.setAlpha(event, fixedPosition, componentSize);
                                mousemove(event);
                            })
                            .on('mousedown', function(event) {
                                Slider.setAlpha(event, fixedPosition, componentSize);
                                bindMouseEvents();
                            })
                            .on('mouseup', function(event){
                                emitEvent('colorpicker-selected-alpha');
                            });
                    }

                    sliderHue
                        .on('click', function(event) {
                            Slider.setHue(event, fixedPosition, componentSize);
                            mousemove(event);
                        })
                        .on('mousedown', function(event) {
                            Slider.setHue(event, fixedPosition, componentSize);
                            bindMouseEvents();
                        })
                        .on('mouseup', function(event){
                            emitEvent('colorpicker-selected-hue');
                        });

                    sliderSaturation
                        .on('click', function(event) {
                            Slider.setSaturation(event, fixedPosition, componentSize);
                            mousemove(event);
                            if (angular.isDefined(attrs.colorpickerCloseOnSelect)) {
                                hideColorpickerTemplate();
                            }
                        })
                        .on('mousedown', function(event) {
                            Slider.setSaturation(event, fixedPosition, componentSize);
                            bindMouseEvents();
                        })
                        .on('mouseup', function(event){
                            emitEvent('colorpicker-selected-saturation');
                        });

                    if (fixedPosition) {
                        colorpickerTemplate.addClass('colorpicker-fixed-position');
                    }

                    colorpickerTemplate.addClass('colorpicker-position-' + position);
                    if (inline === 'true') {
                        colorpickerTemplate.addClass('colorpicker-inline');
                    }

                    target.append(colorpickerTemplate);

                    if (ngModel) {
                        ngModel.$render = function () {
                            elem.val(ngModel.$viewValue);

                            update();
                        };
                    }

                    elem.on('blur keyup change', function() {
                        update();
                    });

                    elem.on('$destroy', function() {
                        colorpickerTemplate.remove();
                    });

                    function previewColor() {
                        try {
                            colorpickerPreview.css('backgroundColor', pickerColor[thisFormat]());
                        } catch (e) {
                            colorpickerPreview.css('backgroundColor', pickerColor.toHex());
                        }
                        sliderSaturation.css('backgroundColor', pickerColor.toHex(pickerColor.value.h, 1, 1, 1));
                        if (thisFormat === 'rgba') {
                            sliderAlpha.css.backgroundColor = pickerColor.toHex();
                        }
                    }

                    function mousemove(event) {
                        var
                            left = Slider.getLeftPosition(event),
                            top = Slider.getTopPosition(event),
                            slider = Slider.getSlider();

                        Slider.setKnob(top, left);

                        if (slider.callLeft) {
                            pickerColor[slider.callLeft].call(pickerColor, left / componentSize);
                        }
                        if (slider.callTop) {
                            pickerColor[slider.callTop].call(pickerColor, top / componentSize);
                        }
                        previewColor();
                        var newColor = pickerColor[thisFormat]();
                        elem.val(newColor);
                        if (ngModel) {
                            $scope.$apply(ngModel.$setViewValue(newColor));
                        }
                        if (withInput) {
                            pickerColorInput.val(newColor);
                        }
                        return false;
                    }

                    function mouseup() {
                        emitEvent('colorpicker-selected');
                        $document.off('mousemove', mousemove);
                        $document.off('mouseup', mouseup);
                    }

                    function update(omitInnerInput) {
                        pickerColor.setColor(elem.val());
                        if (withInput && !omitInnerInput) {
                            pickerColorInput.val(elem.val());
                        }
                        pickerColorPointers.eq(0).css({
                            left: pickerColor.value.s * componentSize + 'px',
                            top: componentSize - pickerColor.value.b * componentSize + 'px'
                        });
                        pickerColorPointers.eq(1).css('top', componentSize * (1 - pickerColor.value.h) + 'px');
                        pickerColorPointers.eq(2).css('top', componentSize * (1 - pickerColor.value.a) + 'px');
                        previewColor();
                    }

                    function getColorpickerTemplatePosition() {
                        var
                            positionValue,
                            positionOffset = Helper.getOffset(elem[0]);

                        if(angular.isDefined(attrs.colorpickerParent)) {
                            positionOffset.left = 0;
                            positionOffset.top = 0;
                        }

                        if (position === 'top') {
                            positionValue =  {
                                'top': positionOffset.top - 147,
                                'left': positionOffset.left
                            };
                        } else if (position === 'right') {
                            positionValue = {
                                'top': positionOffset.top,
                                'left': positionOffset.left + 126
                            };
                        } else if (position === 'bottom') {
                            positionValue = {
                                'top': positionOffset.top + elem[0].offsetHeight + 2,
                                'left': positionOffset.left
                            };
                        } else if (position === 'left') {
                            positionValue = {
                                'top': positionOffset.top,
                                'left': positionOffset.left - 150
                            };
                        }
                        return {
                            'top': positionValue.top + 'px',
                            'left': positionValue.left + 'px'
                        };
                    }

                    function documentMousedownHandler() {
                        hideColorpickerTemplate();
                    }

                    function showColorpickerTemplate() {

                        if (!colorpickerTemplate.hasClass('colorpicker-visible')) {
                            update();
                            colorpickerTemplate
                                .addClass('colorpicker-visible')
                                .css(getColorpickerTemplatePosition());
                            emitEvent('colorpicker-shown');

                            if (inline === false) {
                                // register global mousedown event to hide the colorpicker
                                $document.on('mousedown', documentMousedownHandler);
                            }

                            if (attrs.colorpickerIsOpen) {
                                $scope[attrs.colorpickerIsOpen] = true;
                                if (!$scope.$$phase) {
                                    $scope.$digest(); //trigger the watcher to fire
                                }
                            }
                        }
                    }

                    if (inline === false) {
                        elem.on('click', showColorpickerTemplate);
                    } else {
                        showColorpickerTemplate();
                    }

                    colorpickerTemplate.on('mousedown', function (event) {
                        event.stopPropagation();
                        event.preventDefault();
                    });

                    function emitEvent(name) {
                        if (ngModel) {
                            $scope.$emit(name, {
                                name: attrs.ngModel,
                                value: ngModel.$modelValue
                            });
                        }
                    }

                    function hideColorpickerTemplate() {
                        if (colorpickerTemplate.hasClass('colorpicker-visible')) {
                            colorpickerTemplate.removeClass('colorpicker-visible');
                            emitEvent('colorpicker-closed');
                            // unregister the global mousedown event
                            $document.off('mousedown', documentMousedownHandler);

                            if (attrs.colorpickerIsOpen) {
                                $scope[attrs.colorpickerIsOpen] = false;
                                if (!$scope.$$phase) {
                                    $scope.$digest(); //trigger the watcher to fire
                                }
                            }
                        }
                    }

                    colorpickerTemplate.find('button').on('click', function () {
                        hideColorpickerTemplate();
                    });

                    if (attrs.colorpickerIsOpen) {
                        $scope.$watch(attrs.colorpickerIsOpen, function(shouldBeOpen) {

                            if (shouldBeOpen === true) {
                                showColorpickerTemplate();
                            } else if (shouldBeOpen === false) {
                                hideColorpickerTemplate();
                            }

                        });
                    }
                }
            };
        }]);
})();

(function() {
    'use strict';

    angular
        .module('app')
        .component('buttonList', {
            templateUrl: 'app/components/buttons/buttonList.html',
            controller: buttonListController
        });

    buttonListController.$inject = ['ButtonService'];

    function buttonListController(ButtonService) {
        var vm = this;

        vm.buttons = ButtonService.getAll();
        vm.addButton = addButton;
        vm.toggleGroupRules = toggleGroupRules;


        function addButton(className, role) {
            ButtonService.addButton(className, role);
        }

        function toggleGroupRules(groupName, index) {
            vm.buttons[index].toggleGroup(groupName);
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('app')
        .component('buttonPreviewList', {
            templateUrl: 'app/components/buttons/buttonPreviewList.html',
            controller: buttonPreviewListController
        });

    buttonPreviewListController.$inject = ['ButtonService'];

    function buttonPreviewListController(ButtonService) {
        var vm = this;

        vm.buttons = ButtonService.getAll();

    }

})();
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
(function() {
    'use strict';

    angular
        .module('app')
        .directive('toggleGroupRules', toggleGroupRules);


    function toggleGroupRules() {

        return  {
            restrict: 'A',
            link: link
        };


        function link($scope, element, attrs) {
            var groupName = attrs.toggleGroupRules;

            if ($scope.button.groupRules.indexOf(groupName) >= 0) {
                element.addClass('is-selected');
            } else {
                element.removeClass('is-selected');
            }

            if ((groupName == 'size' || groupName == 'border')
                && ($scope.button.role != 'common' && $scope.button.role != 'inherit')) {
                element.remove();
            } else {
                element.bind('click', function() {
                    element.toggleClass('is-selected');
                });
            }
        }
    }
})();
(function() {
    'use strict';

    angular.module('app')
        .directive('toggleSilentRule', toggleSilentRule);

    toggleSilentRule.$inject = ['defaultRules'];

    function toggleSilentRule(defaultRules) {
        return  {
            require: '?ngModel',
            restrict: 'A',
            link: link
        };

        function link($scope, element, attrs, ngModel) {
            var rule = attrs.toggleSilentRule;
            var rules = {
                'font-weight': 'bold',
                'font-style': 'italic',
                'text-transform': 'uppercase'
            };
            var ruleValue = rules[rule];

            if ($scope.button.rules[rule] !== undefined && $scope.button.rules[rule] !== 'normal') {
                element.addClass('is-checked');
            } else {
                element.removeClass('is-checked');
            }

            element.bind('click', function() {
                //ButtonService.setSilentRule($scope.button, rule);
                element.toggleClass('is-checked');

                if (ngModel) {
                    if (ngModel.$modelValue !== ruleValue) {
                        $scope.$apply(ngModel.$setViewValue(ruleValue));
                    } else {
                        $scope.$apply(ngModel.$setViewValue(defaultRules[rule]));
                    }
                }

                console.log(ngModel.$modelValue);
            });

            //console.log(element.val());
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('app')
        .factory('Button', Button)
        .factory('ButtonService', ButtonService);

    Button.$inject = ['defaultRules', 'groupRulesDeps'];

    function Button(defaultRules, groupRulesDeps) {

        function NewButton(className, role) {
            this.classname = className || 'button';
            this.role = role || 'common';
            this.rules = {};
            this.groupRules = [];
        }

        NewButton.prototype = {
            update: update,
            addGroupRules: addGroupRules,
            toggleGroup: toggleGroup,
            addRulesByGroup: addRulesByGroup,
            deleteRulesByGroup: deleteRulesByGroup
        };

        return NewButton;

        function update(json) {
            for (var param in json) {
                this[param] = json[param];
            }
        }

        function addGroupRules(groupName) {
            this.groupRules.push(groupName);
        }

        function toggleGroup(groupName) {
            var index = this.groupRules.indexOf(groupName);

            if (index !== -1) {
                this.groupRules.splice(index, 1);
                this.deleteRulesByGroup(groupName);
            } else {
                this.addGroupRules(groupName);
                this.addRulesByGroup(groupName);
            }
        }

        function addRulesByGroup(groupName) {
            var self = this;
            angular.forEach(groupRulesDeps[groupName], function(rule) {
                self.rules[rule] = defaultRules[rule];
            });
        }

        function deleteRulesByGroup(groupName) {
            var self = this;
            angular.forEach(groupRulesDeps[groupName], function(rule) {
                if (self.rules[rule] !== undefined) {
                    delete self.rules[rule];
                }
            });
        }
    }


    ButtonService.$inject = ['$http', 'Button'];

    function ButtonService($http, Button) {

        var buttons = [];

        return {
            getAll: getAll,
            addButton: addButton,
            setSilentRule: setSilentRule,
            loadJSON: loadJSON
        };


        function getAll() {
            return buttons;
        }

        function loadJSON(param) {
            $http.get('data/' + param + '.json').success(function(json) {
                angular.forEach(json.button, function(btn) {
                    addButton(btn.classname, btn.role).update(btn);
                });
            });
        }

        function addButton(className, role) {
            var button = new Button(className, role);
            buttons.push(button);
            return button;
        }

        function setSilentRule(button, rule) {
            var index = buttons.indexOf(button);
            var rules = {
                'font-weight': 'bold',
                'font-style': 'italic',
                'text-transform': 'uppercase'
            };

            buttons[index].rules[rule] = rules[rule];

            console.log(buttons);
        }

    }
})();
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

            this.size = function() {
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

            this.font = function() {
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
            this.radius = function() {
                if (rules['border-radius'] !== undefined) {
                    styles += tab + 'border-radius: ' + rules['border-radius'] + units + ';\n';
                }
            };
            this.shadow = function() {};
        }
    }


})();