(function() {
    'use strict';

    angular.module('app')
        .directive('togglePseudoClass', TogglePseudoClassDirective);

    TogglePseudoClassDirective.$inject = ['ButtonService'];

    function TogglePseudoClassDirective(ButtonService) {
        return  {
            restrict: 'A',
            link: link
        };

        function link($scope, element, attrs) {
            var toggle,
                selectors;

            if ($scope.button.role != 'common' && $scope.button.role != 'inherit') {
                element.remove();
                return false;
            }

            toggle = element.find('a');
            selectors = ButtonService.getSelectorsFor($scope.button.classname);

            angular.forEach(toggle, function(a) {
                var $a = angular.element(a);
                if (selectors.indexOf($a.attr('pseudo-class')) >= 0) {
                    $a.addClass('is-checked');
                }
            });


            toggle.bind('click', function($ev) {
                var el = angular.element(this);
                var selector = el.attr('pseudo-class');

                ButtonService.toggleButtonSelector($scope.button.classname, selector);

                el.toggleClass('is-checked');
                $scope.$apply();
            });


            /*
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
            });*/
        }
    }

})();