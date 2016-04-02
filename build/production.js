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

        vm.options = ButtonService.getOptions();
        vm.buttons = ButtonService.getAll();
        vm.appendButton = appendButton;
        vm.toggleGroupRules = toggleGroupRules;
        vm.removeButton = removeButton;
        vm.getSections = getSections;


        function appendButton(modifier) {
            ButtonService.addButton(modifier).addState('common');
        }

        function removeButton(index) {
            vm.buttons.splice(index, 1);
        }

        function toggleGroupRules(groupName, index) {
            vm.buttons[index].toggleGroup(groupName);
        }


        function getSections(btn) {
            var sections = [],
                copy = angular.copy(btn);

            for (var prop in copy) {
                if (copy.hasOwnProperty(prop) && prop != 'modifier' && copy[prop] != null) {
                    sections.push(prop);
                }
            }
            return sections;
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

        vm.options = ButtonService.getOptions();
        vm.buttons = ButtonService.getAll();
    }

})();
(function() {
    'use strict';

    angular.module('app')
        .directive('rangeSlider', rangeSliderDirective);

    rangeSliderDirective.$inject = ['$timeout'];

    function rangeSliderDirective($timeout) {

        var modes = {
            single  : 'SINGLE',
            range   : 'RANGE'
        };

        var events = {
            mouse: {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            },
            touch: {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend'
            }
        };

        function roundStep(value, precision, step, floor) {
            var remainder = (value - floor) % step;
            var steppedValue = remainder > (step / 2) ? value + step - remainder : value - remainder;
            var decimals = Math.pow(10, precision);
            var roundedValue = steppedValue * decimals / decimals;
            return parseFloat(roundedValue.toFixed(precision));
        }

        function offset(element, position) {
            return element.css({
                left: position
            });
        }

        function pixelize(position) {
            return position + "px";
        }

        function contain(value) {
            if (isNaN(value)) return value;
            return Math.min(Math.max(0, value), 100);
        }

        return {

            restrict: 'EA',

            scope: {
                floor       : '@',
                ceiling     : '@',
                step        : '@',
                highlight   : '@',
                precision   : '@',
                buffer      : '@',
                dragstop    : '@',
                ngModel     : '=?',
                ngModelLow  : '=?',
                ngModelHigh : '=?'
            },

            link : function(scope, element, attrs) {

                element.addClass('range-slider');

                var currentMode = (attrs.ngModel == null) && (attrs.ngModelLow != null) && (attrs.ngModelHigh != null) ? modes.range : modes.single;

                // Dom Components
                var children = element.children();
                var bar         = angular.element(children[0]),
                    lowPointer  = angular.element(children[1]),
                    highPointer = angular.element(children[2]),
                    floorBubble = angular.element(children[3]),
                    ceilBubble  = angular.element(children[4]),
                    lowBubble   = angular.element(children[5]),
                    highBubble  = angular.element(children[6]),
                    highlight   = angular.element(bar.children()[0]),
                    ngDocument  = angular.element(document);

                var low, high;
                if (currentMode === modes.single) {
                    low = 'ngModel';
                    highPointer.remove();
                    highBubble.remove();
                } else {
                    low = 'ngModelLow';
                    high = 'ngModelHigh';
                }

                scope.local = {};
                scope.local[low] = scope[low];
                scope.local[high] = scope[high];

                // Control Dimensions Used for Calculations
                var handleHalfWidth = 0,
                    barWidth = 0,
                    minOffset = 0,
                    maxOffset = 0,
                    minValue = 0,
                    maxValue = 0,
                    valueRange = 0,
                    offsetRange = 0;

                var bindingsSet = false;

                var updateCalculations = function() {

                    if (scope.step === undefined) scope.step = 1;
                    if (scope.floor === undefined) scope.floor = 0;
                    if (scope.ceiling === undefined) scope.ceiling = 100; //TODO: Make this more intelligent
                    if (scope.precision === undefined) scope.precision = 0;

                    if (currentMode === modes.single) {
                        scope.ngModelLow = scope.ngModel;
                    }

                    scope.local[low] = scope[low];
                    scope.local[high] = scope[high];

                    scope.floor = roundStep(parseFloat(scope.floor), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                    scope.ceiling = roundStep(parseFloat(scope.ceiling), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));

                    if (currentMode === modes.range) {
                        scope.ngModelLow = roundStep(parseFloat(scope.ngModelLow), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                        scope.ngModelHigh = roundStep(parseFloat(scope.ngModelHigh), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                    } else {
                        scope.ngModel = roundStep(parseFloat(scope.ngModel), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                    }

                    handleHalfWidth = lowPointer[0].offsetWidth / 2;
                    barWidth = bar[0].offsetWidth;
                    minOffset = 0;
                    maxOffset = barWidth - lowPointer[0].offsetWidth;
                    minValue = parseFloat(scope.floor);
                    maxValue = parseFloat(scope.ceiling);
                    valueRange = maxValue - minValue;
                    offsetRange = maxOffset - minOffset;

                };

                var updateDOM = function () {
                    updateCalculations();

                    var percentOffset = function (offset) {
                        return contain(((offset - minOffset) / offsetRange) * 100);
                    };

                    var percentValue = function (value) {
                        return contain(((value - minValue) / valueRange) * 100);
                    };

                    var pixelsToOffset = function (percent) {
                        return pixelize(percent * offsetRange / 100);
                    };

                    var setPointers = function () {
                        offset(ceilBubble, pixelize(barWidth - ceilBubble[0].offsetWidth));

                        var newLowValue, newHighValue;
                        newLowValue = percentValue(scope.local[low]);
                        offset(lowPointer, pixelsToOffset(newLowValue));
                        offset(lowBubble, pixelize(lowPointer[0].offsetLeft - (lowBubble[0].offsetWidth / 2) + handleHalfWidth));
                        offset(highlight, pixelize(lowPointer[0].offsetLeft + handleHalfWidth));

                        if (currentMode === modes.range) {
                            newHighValue = percentValue(scope.local[high]);
                            offset(highPointer, pixelsToOffset(newHighValue));
                            offset(highBubble, pixelize(highPointer[0].offsetLeft - (highBubble[0].offsetWidth / 2) + handleHalfWidth));

                            highlight.css({
                                width: pixelsToOffset(newHighValue - newLowValue)
                            });

                        } else if (scope.highlight === 'right') {

                            highlight.css({
                                width: pixelsToOffset(110 - newLowValue)
                            });

                        }
                        else if (scope.highlight === 'left') {

                            highlight.css({
                                width: pixelsToOffset(newLowValue)
                            });

                            offset(highlight, 0);
                        }

                    };

                    var bind = function (handle, bubble, ref, events) {

                        var currentRef = ref;

                        var onEnd = function () {
                            bubble.removeClass('active');
                            handle.removeClass('active');
                            ngDocument.unbind(events.move);
                            ngDocument.unbind(events.end);
                            if (scope.dragstop) {
                                scope[high] = scope.local[high];
                                scope[low] = scope.local[low];
                            }
                            currentRef = ref;
                            scope.$apply();
                        };

                        var onMove = function (event) {

                            // Suss out which event type we are capturing and get the x value
                            var eventX = 0;
                            if (event.clientX !== undefined) {
                                eventX = event.clientX;
                            }
                            else if ( event.touches !== undefined && event.touches.length) {
                                eventX = event.touches[0].clientX;
                            }
                            else if ( event.originalEvent !== undefined &&
                                event.originalEvent.changedTouches !== undefined &&
                                event.originalEvent.changedTouches.length) {
                                eventX = event.originalEvent.changedTouches[0].clientX;
                            }

                            var newOffset = Math.max(Math.min((eventX - element[0].getBoundingClientRect().left - handleHalfWidth), maxOffset), minOffset),
                                newPercent = percentOffset(newOffset),
                                newValue = minValue + (valueRange * newPercent / 100.0);

                            if (currentMode === modes.range) {
                                switch (currentRef) {
                                    case low:
                                        if (newValue > scope.local[high]) {
                                            currentRef = high;
                                            lowPointer.removeClass('active');
                                            lowBubble.removeClass('active');
                                            highPointer.addClass('active');
                                            highBubble.addClass('active');
                                            setPointers();
                                        } else if (scope.buffer > 0) {
                                            newValue = Math.min(newValue, scope.local[high] - scope.buffer);
                                        }
                                        break;
                                    case high:
                                        if (newValue < scope.local[low]) {
                                            currentRef = low;
                                            highPointer.removeClass('active');
                                            highBubble.removeClass('active');
                                            lowPointer.addClass('active');
                                            lowBubble.addClass('active');
                                            setPointers();
                                        } else if (scope.buffer > 0) {
                                            newValue = Math.max(newValue, parseInt(scope.local[low]) + parseInt(scope.buffer));
                                        }
                                }
                            }

                            newValue = roundStep(newValue, parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                            scope.local[currentRef] = newValue;

                            if (!scope.dragstop) {
                                scope[currentRef] = newValue;
                            }

                            setPointers();
                            scope.$apply();
                        };

                        var onStart = function (event) {
                            updateCalculations();
                            bubble.addClass('active');
                            handle.addClass('active');
                            setPointers();
                            event.stopPropagation();
                            event.preventDefault();
                            ngDocument.bind(events.move, onMove);
                            return ngDocument.bind(events.end, onEnd);
                        };

                        handle.bind(events.start, onStart);
                    };

                    var setBindings = function () {
                        var method, i;
                        var inputTypes = ['touch', 'mouse'];
                        for (i = 0; i < inputTypes.length; i++) {
                            method = inputTypes[i];

                            if (currentMode === modes.range) {
                                bind(lowPointer, lowBubble, low, events[method]);
                                bind(highPointer, highBubble, high, events[method]);
                            } else {
                                bind(lowPointer, lowBubble, low, events[method]);
                            }
                        }

                        bindingsSet = true;
                    };

                    if (!bindingsSet) {
                        setBindings();
                    }

                    setPointers();
                };

                // Watch Models based on mode
                scope.$watch(low, updateDOM);

                if (currentMode === modes.range) {
                    scope.$watch(high, updateDOM);
                }

                window.addEventListener('resize', updateDOM);
            },

            template :  '<div class="bar"><div class="selection"></div></div>' +
            '<div class="handle low"></div>' +
            '<div class="handle high"></div>' +
            '<div class="bubble limit low">{{ floor }}</div>' +
            '<div class="bubble limit high">{{ ceiling }}</div>' +
            '<div class="bubble value low">{{ ngModelLow }}</div>' +
            '<div class="bubble value high">{{ ngModelHigh }}</div>'

        }

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

            if ($scope.button[$scope.section].groupRules.indexOf(groupName) >= 0) {
                element.addClass('is-selected');
            } else {
                element.removeClass('is-selected');
            }

            element.bind('click', function() {
                $scope.button[$scope.section].toggleGroup(groupName);
                element.toggleClass('is-selected');
                $scope.$apply();
            });
        }
    }
})();
(function() {
    'use strict';

    angular.module('app')
        .directive('toggleSelector', ToggleSelectorDirective);


    function ToggleSelectorDirective() {
        return  {
            restrict: 'A',
            link: link,
            template:   '<a class="control-item" data-selector="hover" href="#">&:hover</a>'+
                        '<a class="control-item" data-selector="active" href="#">&:active</a>'+
                        '<a class="control-item" data-selector="focus" href="#">&:focus</a>'+
                        '<a class="control-item" data-selector="disabled" href="#">&:disabled</a>'
        };

        function link($scope, element, attrs) {
            var toggle = element.find('a'),
                activeSelectors = $scope.button.getActiveSelectors();


            angular.forEach(toggle, function(a) {
                var $a = angular.element(a);
                if (activeSelectors.indexOf($a.attr('data-selector')) >= 0) {
                    $a.addClass('is-checked');
                }
            });


            toggle.bind('click', function($ev) {
                var el = angular.element(this);
                var selector = el.attr('data-selector');

                $scope.button.toggleSelector(selector);

                el.toggleClass('is-checked');
                $scope.$apply();
            });
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
            replace: true,
            restrict: 'A',
            scope: {
                ngModel: '='
            },
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

            if ($scope.ngModel !== undefined && $scope.ngModel !== 'normal') {
                element.addClass('is-checked');
            } else {
                element.removeClass('is-checked');
            }

            element.bind('click', function() {
                element.toggleClass('is-checked');
                if ($scope.ngModel !== ruleValue) {
                    $scope.ngModel = ruleValue;
                } else {
                    $scope.ngModel = defaultRules[rule];
                }
                $scope.$apply();
            });
        }
    }

})();
(function() {
    'use strict';

    angular
        .module('app')
        .factory('ButtonState', ButtonState)
        .factory('Button', Button)
        .factory('ButtonService', ButtonService);

    ButtonState.$inject = ['defaultRules', 'groupRulesDeps'];

    function ButtonState(defaultRules, groupRulesDeps) {

        function State() {
            this.rules = {};
            this.groupRules = [];
        }

        State.prototype = {
            update: update,
            toggleGroup: toggleGroup,
            addRulesByGroup: addRulesByGroup,
            deleteRulesByGroup: deleteRulesByGroup
        };

        return State;

        function update(json) {
            var self = this;
            var prop;
            for (prop in json) {
                self[prop] = json[prop];
            }
        }

        function toggleGroup(group) {
            var index = this.groupRules.indexOf(group);

            if (index >= 0) {
                this.groupRules.splice(index, 1);
                this.deleteRulesByGroup(group);
            } else {
                this.groupRules.push(group);
                this.addRulesByGroup(group);
            }
        }

        function addRulesByGroup(group) {
            var self = this;
            angular.forEach(groupRulesDeps[group], function(rule) {
                self.rules[rule] = defaultRules[rule];
            });
        }

        function deleteRulesByGroup(group) {
            var self = this;
            angular.forEach(groupRulesDeps[group], function(rule) {
                if (self.rules[rule] !== 'undefined') {
                    delete self.rules[rule];
                }
            });
        }
    }


    Button.$inject = ['ButtonState'];

    function Button(ButtonState) {

        var selectors = ['hover', 'active', 'focus', 'disabled'];

        function ButtonConstructor(modifier) {
            this.modifier = modifier || null;
            this.common = null;

            for (var i = 0; i < selectors.length; i++) {
                this[selectors[i]] = null;
            }
        }

        ButtonConstructor.prototype = {
            addState: addState,
            cleanState: cleanState,
            toggleSelector: toggleSelector,
            getSelectors: getSelectors,
            getActiveSelectors: getActiveSelectors
        };

        return ButtonConstructor;

        function addState(state) {
            if (this.hasOwnProperty(state)) {
                this[state] = new ButtonState();
                return this[state];
            }
            return false;
        }

        function cleanState(state) {
            if (this.hasOwnProperty(state)) {
                this[state] = null;
                return true;
            }
            return false;
        }

        function toggleSelector(selector) {
            if (selectors.indexOf(selector) >= 0) {
                if (this[selector] === null) {
                    return this.addState(selector);
                } else {
                    return this.cleanState(selector);
                }
            }
        }

        function getSelectors() {
            return selectors;
        }

        function getActiveSelectors() {
            var active = [];
            for (var i = 0; i < selectors.length; i++) {
                if (this[selectors[i]] !== null) {
                    active.push(selectors[i]);
                }
            }
            return active;
        }
    }


    ButtonService.$inject = ['$http', 'Button'];

    function ButtonService($http, Button) {

        var options = {
            className: 'button',
            separator: '_'
        };
        var buttons = [];

        return {
            getAll: getAll,
            getOptions: getOptions,
            addButton: addButton,
            setSilentRule: setSilentRule,
            toggleButtonSelector: toggleButtonSelector,
            loadJSON: loadJSON,
            renameClass: renameClass
        };


        function getAll() {
            return buttons;
        }

        function getOptions() {
            return options;
        }

        function loadJSON(param) {

            addButton().addState('common').toggleGroup('size');
            buttons[0].addState('hover').toggleGroup('fill');

            /*$http.get('data/' + param + '.json').success(function(json) {
                angular.forEach(json.button, function(btn) {
                    addButton(btn.classname, btn.role).update(btn);
                });
            });*/
        }

        function addButton(modifier) {
            var button = new Button(modifier);
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

        function toggleButtonSelector(className, role) {
            var count = buttons.length,
                i = 0;

            angular.forEach(buttons, function(btn, index) {
                i++;
                if (btn.classname == className) {
                    if (btn.role == role) {
                        buttons.splice(index, 1);
                        return;
                    }
                }
                if (i == count){
                    addButton(className, role);
                }
            });
        }

        function renameClass(oldClass, newClass) {
            angular.forEach(buttons, function(btn) {
                if (btn.classname == oldClass) {
                    btn.classname = newClass;
                }
            });
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
            styles,
            separator = '_';

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
            var options = ButtonService.getOptions();
            var buttonClass = options.className;

            separator = options.separator;

            // Clean old styles
            styles = '/* Button Component styles */\n';

            angular.forEach(buttons, function(button) {
                var buttonCopy = angular.copy(button);
                for (var section in buttonCopy) {
                    if (buttonCopy.hasOwnProperty(section) && section != 'modifier' && !!button[section]) {
                        _compileSilentBtn(button, section, buttonClass);
                    }
                }
            });

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


        /**
         * Renderer styles by rules group
         * @param rules
         * @param role
         * @constructor
         */
        function Render(rules, role) {
            var render = {};

            render.size = function() {
                if (!!rules['height']) {
                    var line_height = (!!rules['border']) ? rules['height'] - rules['border'] * 2 : rules['height'];

                    styles += tab + 'height: ' + rules.height + units + ';\n';
                    styles += tab + 'line-height: ' + line_height + units + ';\n';

                    if (!!rules['padding']) {
                        rules['padding-right'] = rules['padding-left'] = rules['padding'];
                    }
                    styles += tab + 'padding: ' + rules['padding-top'] + units + ' ' + rules['padding-right'] + units + ' ' + rules['padding-bottom'] + units + ' ' + rules['padding-left'] + units + ';\n';
                }
            };

            render.fill = function() {
                if (!!rules['background']) {
                    styles += tab + 'background: ' + rules['background'] + ';\n';
                }
            };

            render.border = function() {
                if (!!rules['border'] && rules['border'] != 0 ) {
                    styles += tab + 'border: ' + rules['border'] + units + ' solid ' + rules['border-color'] + ';\n';
                } else if (role == 'common') {
                    styles += tab + 'border: none;\n';
                }
            };

            render.font = function() {
                if (!!rules['font-size'] && !!rules['color']) {
                    styles += tab + 'font-size: ' + rules['font-size'] + units + ';\n';
                    styles += tab + 'color: ' + rules['color'] + ';\n';
                }
                if (!!rules['font-weight']) {
                    styles += tab + 'font-weight: ' + rules['font-weight'] + ';\n';
                }
                if (!!rules['font-style']) {
                    styles += tab + 'font-style: ' + rules['font-style'] + ';\n';
                }
                if (!!rules['text-transform']) {
                    styles += tab + 'text-transform: ' + rules['text-transform'] + ';\n';
                }
            };
            render.radius = function() {
                if (!!rules['border-radius']) {
                    styles += tab + 'border-radius: ' + rules['border-radius'] + units + ';\n';
                }
            };
            render.shadow = function() {};

            return render;
        }
    }


})();