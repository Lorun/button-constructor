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

        vm.options = ButtonService.getOptions();
        vm.buttons = ButtonService.getAll();
        vm.appendButton = appendButton;
        vm.toggleGroupRules = toggleGroupRules;
        vm.removeButton = removeButton;


        function appendButton(modifier) {
            ButtonService.addButton(modifier).addState('common');
        }

        function removeButton(index) {
            vm.buttons.splice(index, 1);
        }

        function toggleGroupRules(groupName, index) {
            vm.buttons[index].toggleGroup(groupName);
        }
    }

})();