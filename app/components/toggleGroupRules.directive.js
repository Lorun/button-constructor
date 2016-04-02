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