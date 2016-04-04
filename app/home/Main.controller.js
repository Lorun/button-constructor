(function() {
    'use strict';

    angular
        .module('app')
        .controller('MainCtrl', MainController);

    MainController.$inject = ['ButtonService'];

    function MainController(ButtonService) {
        var vm = this;

        vm.options = ButtonService.getOptions();
        vm.load = load;

        function load(param) {
            console.log(param);
            ButtonService.loadJSON(param);
        }
    }

})();