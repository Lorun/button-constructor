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