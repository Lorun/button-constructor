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