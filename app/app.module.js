(function() {
    'use strict';

    angular
        .module('app', [])
        .constant('defaultRules', {
            'height'            : 30,
            'line-height'       : 30,
            'padding'           : 15,
            'padding-left'      : 15,
            'padding-right'     : 15,
            'padding-top'       : 0,
            'padding-bottom'    : 0,
            'background'        : '#4980b7',
            'border-color'      : '#2f4255',
            'border'            : 1,
            'font-size'         : 14,
            'color'             : '#fff',
            'border-radius'     : 4,
            'box-shadow-color'  : 'rgba(0,0,0,0.2)',
            'box-shadow-x'      : 0,
            'box-shadow-y'      : 1,
            'box-shadow-blur'   : 4
        })
        .constant('groupRulesDeps', {
            'size'      : ['height', 'line-height', 'padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom'],
            'fill'      : ['background'],
            'font'      : ['font-size', 'color'],
            'uppercase' : ['text-transform'],
            'border'    : ['border', 'border-color'],
            'radius'    : ['border-radius'],
            'shadow'    : ['box-shadow-color', 'box-shadow-x', 'box-shadow-y', 'box-shadow-blur']
        });

})();