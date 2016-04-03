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
            'border-color'      : '#3171b1',
            'border'            : 1,
            'font-size'         : 14,
            'color'             : '#ffffff',
            'font-weight'       : 'normal',
            'border-radius'     : 4,
            'box-shadow-color'  : 'rgba(0, 0, 0, 0.2)',
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