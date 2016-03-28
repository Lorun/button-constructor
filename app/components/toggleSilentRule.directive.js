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