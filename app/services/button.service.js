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


    ButtonService.$inject = ['$http', '$filter', 'Button'];

    function ButtonService($http, $filter, Button) {

        var buttons = [];

        return {
            getAll: getAll,
            addButton: addButton,
            setSilentRule: setSilentRule,
            toggleButtonSelector: toggleButtonSelector,
            loadJSON: loadJSON,
            renameClass: renameClass,
            getSelectorsFor: getSelectorsFor
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
            var button = new Button(className, role),
                count = buttons.length,
                isAdded = false,
                i = 0;

            angular.forEach(buttons, function(btn, index) {
                i++;
                if (btn.classname == className && !isAdded) {
                    buttons.splice(index+1, 0, button);
                    isAdded = true;
                }
                if (i == count && !isAdded) {
                    buttons.push(button);
                }
            });

            if (count == 0) {
                buttons.push(button);
            }

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

        function toggleButtonSelector(className, role) {
            var count = buttons.length,
                i = 0;

            angular.forEach(buttons, function(btn, index) {
                i++;
                if (btn.classname == className) {
                    if (btn.role == role) {
                        buttons.splice(index, 1);
                        return;
                    }
                }
                if (i == count){
                    addButton(className, role);
                }
            });
        }

        function renameClass(oldClass, newClass) {
            angular.forEach(buttons, function(btn) {
                if (btn.classname == oldClass) {
                    btn.classname = newClass;
                }
            });
        }

        function getSelectorsFor(className) {
            var selectors = [];
            angular.forEach(buttons, function(btn) {
                if (btn.classname == className && btn.role != 'common') {
                    selectors.push(btn.role);
                }
            });
            return selectors;
        }

    }
})();