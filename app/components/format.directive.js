(function() {
    'use strict';

    angular
        .module('app')
        .directive('format', function() {
            return {
                require: '?ngModel',
                link: link
            };

            function link(scope, elem, attrs, ctrl) {
                if (!ctrl) return;


                ctrl.$parsers.unshift(function (viewValue) {
                    viewValue = viewValue.replace(/[^-a-zA-Z0-9]+/g, "");
                    console.log(viewValue);
                    ctrl.$setViewValue(viewValue);
                    ctrl.$render();
                    return elem.val();
                });

                /*ctrl.$formatters.unshift(function (a) {
                    console.log('formatters');
                    return ctrl.$modelValue + '_';
                });*/



                /*ctrl.$parsers.unshift(function (viewValue) {

                    elem.priceFormat({
                        prefix: '',
                        centsSeparator: ',',
                        thousandsSeparator: '.'
                    });

                    return elem[0].value;
                });*/
            }
    });
})();