(function() {
    'use strict';

    angular
        .module('app')
        .directive('toggleClass', toggleClass);

    function toggleClass() {

        var directive =  {
            restrict: 'A',
            link: link
        };

        return directive;

        function link($scope, element, attrs) {
            element.bind('click', function() {
                element.toggleClass(attrs.toggleClass);
            });
        }
    }
})();