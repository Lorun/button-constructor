(function() {
    'use strict';

    angular
        .module('app')
        .component('buttonList', {
            templateUrl: 'app/components/buttons/buttonList.html',
            controller: buttonListController
        });

    buttonListController.$inject = ['ButtonService'];

    function buttonListController(ButtonService) {
        var vm = this;

        vm.buttons = ButtonService.getAll();
        vm.addButton = addButton;
        vm.toggleGroupRules = toggleGroupRules;


        function addButton(className, role) {
            ButtonService.addButton(className, role);
        }

        function toggleGroupRules(groupName, index) {
            vm.buttons[index].toggleGroup(groupName);
        }
    }

})();