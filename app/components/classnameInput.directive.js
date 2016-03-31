(function() {
    'use strict';

    angular.module('app')
        .directive('classnameInput', classnameDirective);

    classnameDirective.$inject = ['ButtonService'];

    function classnameDirective(ButtonService) {
        return  {
            replace: true,
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            link: link
        };

        function link($scope, element, attrs) {
            var role = attrs.role,
                input;


            if (role == 'inherit') {
                input = angular.element('<input type="text" name="class_mod">');
                element.after(input);
                element.css('display', 'none');
                input.val($scope.ngModel.split('_')[1]);

                input.on('blur keyup change', function() {
                    //$scope.ngModel = $scope.ngModel.split('_')[0]+'_'+input.val();
                    ButtonService.renameClass($scope.ngModel, $scope.ngModel.split('_')[0]+'_'+input.val());
                    $scope.$apply();
                });
            } else if (role == 'common') {
                var oldClass = $scope.ngModel;

                element.on('blur keyup change', function() {
                    // TODO: Перенести в ButtonService
                    var buttons = ButtonService.getAll(),
                        count = buttons.length,
                        i = 0;
                    angular.forEach(ButtonService.getAll(), function(button) {
                        var classMod = button.classname.split('_')[1];
                        i++;
                        if (!!classMod) {
                            button.classname = $scope.ngModel+'_'+button.classname.split('_')[1];
                            $scope.$apply();
                        } else if (button.classname == oldClass) {
                            button.classname = $scope.ngModel;
                            $scope.$apply();
                        }

                        if (count == i) {
                            oldClass = $scope.ngModel;
                        }
                    });
                });
            } else {

                element.after(angular.element('<span>&:'+role+'</span>'));
                element.css('display', 'none');
            }
        }
    }

})();