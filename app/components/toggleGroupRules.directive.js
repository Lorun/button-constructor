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