(function() {
    'use strict';

    angular
        .module('app')
        .controller('buttonController', buttonController);

    buttonController.$inject = ['Button'];

    function buttonController(Button) {
        var vm = this;

        vm.buttons = Button.getAll();
        vm.addButton = addButton;
        vm.toggleGroupRules = toggleGroupRules;


        /* Add first Common Button */
        addButton('common');

        function addButton(role) {
            Button.addButton({
                classname: 'button',
                role: role,
                rules: {},
                groupRules: []
            });
        }

        function toggleGroupRules(groupName, index) {
            Button.rulesResolver(groupName, index);
        }
    }
})();