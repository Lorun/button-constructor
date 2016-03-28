(function() {
    'use strict';

    angular
        .module('app')
        .factory('Button', Button)
        .factory('ButtonService', ButtonService);

    Button.$inject = ['defaultRules', 'groupRulesDeps'];

    function Button(defaultRules, groupRulesDeps) {

        function NewButton(className, role) {
            this.classname = className || 'button';
            this.role = role || 'common';
            this.rules = {};
            this.groupRules = [];
        }

        NewButton.prototype = {
            update: update,
            addGroupRules: addGroupRules,
            toggleGroup: toggleGroup,
            addRulesByGroup: addRulesByGroup,
            deleteRulesByGroup: deleteRulesByGroup
        };

        return NewButton;

        function update(json) {
            for (var param in json) {
                this[param] = json[param];
            }
        }

        function addGroupRules(groupName) {
            this.groupRules.push(groupName);
        }

        function toggleGroup(groupName) {
            var index = this.groupRules.indexOf(groupName);

            if (index !== -1) {
                this.groupRules.splice(index, 1);
                this.deleteRulesByGroup(groupName);
            } else {
                this.addGroupRules(groupName);
                this.addRulesByGroup(groupName);
            }
        }

        function addRulesByGroup(groupName) {
            var self = this;
            angular.forEach(groupRulesDeps[groupName], function(rule) {
                self.rules[rule] = defaultRules[rule];
            });
        }

        function deleteRulesByGroup(groupName) {
            var self = this;
            angular.forEach(groupRulesDeps[groupName], function(rule) {
                if (self.rules[rule] !== undefined) {
                    delete self.rules[rule];
                }
            });
        }
    }


    ButtonService.$inject = ['$http', 'Button'];

    function ButtonService($http, Button) {

        var buttons = [];

        return {
            getAll: getAll,
            addButton: addButton,
            setSilentRule: setSilentRule,
            loadJSON: loadJSON
        };


        function getAll() {
            return buttons;
        }

        function loadJSON(param) {
            $http.get('data/' + param + '.json').success(function(json) {
                angular.forEach(json.button, function(btn) {
                    addButton(btn.classname, btn.role).update(btn);
                });
            });
        }

        function addButton(className, role) {
            var button = new Button(className, role);
            buttons.push(button);
            return button;
        }

        function setSilentRule(button, rule) {
            var index = buttons.indexOf(button);
            var rules = {
                'font-weight': 'bold',
                'font-style': 'italic',
                'text-transform': 'uppercase'
            };

            buttons[index].rules[rule] = rules[rule];

            console.log(buttons);
        }

    }
})();