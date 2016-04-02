(function() {
    'use strict';

    angular
        .module('app')
        .component('buttonPreviewList', {
            templateUrl: 'app/components/buttons/buttonPreviewList.html',
            controller: buttonPreviewListController
        });

    buttonPreviewListController.$inject = ['ButtonService'];

    function buttonPreviewListController(ButtonService) {
        var vm = this;

        vm.options = ButtonService.getOptions();
        vm.buttons = ButtonService.getAll();
    }

})();