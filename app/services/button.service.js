(function() {
    'use strict';

    angular
        .module('app')
        .factory('Button', Button);

    Button.$inject = ['defaultRules', 'groupRulesDeps'];

    function Button(defaultRules, groupRulesDeps) {

        var buttons = [];

        return {
            getAll: getAll,
            addButton: addButton,
            rulesResolver: rulesResolver
        };


        function getAll() {
            return buttons;
        }

        function addButton(button) {
            buttons.push(button);
        }

        function rulesResolver(groupName, i) {
            var index = buttons[i].groupRules.indexOf(groupName);

            if (index !== -1) {
                buttons[i].groupRules.splice(index, 1);
                deleteRules(groupName, i);
            } else {
                buttons[i].groupRules.push(groupName);
                addDefaultsRules(groupName, i);
            }
        }

        function deleteRules(groupName, i) {
            angular.forEach(groupRulesDeps[groupName], function(rule) {
                if (buttons[i].rules[rule] !== 'undefined') {
                    delete buttons[i].rules[rule];
                }
            });
        }

        function addDefaultsRules(groupName, i) {
            angular.forEach(groupRulesDeps[groupName], function(rule) {
                buttons[i].rules[rule] = defaultRules[rule];
            });
        }
    }
})();