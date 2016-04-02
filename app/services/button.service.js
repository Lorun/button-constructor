(function() {
    'use strict';

    angular
        .module('app')
        .factory('ButtonState', ButtonState)
        .factory('Button', Button)
        .factory('ButtonService', ButtonService);

    ButtonState.$inject = ['defaultRules', 'groupRulesDeps'];

    function ButtonState(defaultRules, groupRulesDeps) {

        function State() {
            this.rules = {};
            this.groupRules = [];
        }

        State.prototype = {
            update: update,
            toggleGroup: toggleGroup,
            addRulesByGroup: addRulesByGroup,
            deleteRulesByGroup: deleteRulesByGroup
        };

        return State;

        function update(json) {
            var self = this;
            var prop;
            for (prop in json) {
                self[prop] = json[prop];
            }
        }

        function toggleGroup(group) {
            var index = this.groupRules.indexOf(group);

            if (index >= 0) {
                this.groupRules.splice(index, 1);
                this.deleteRulesByGroup(group);
            } else {
                this.groupRules.push(group);
                this.addRulesByGroup(group);
            }
        }

        function addRulesByGroup(group) {
            var self = this;
            angular.forEach(groupRulesDeps[group], function(rule) {
                self.rules[rule] = defaultRules[rule];
            });
        }

        function deleteRulesByGroup(group) {
            var self = this;
            angular.forEach(groupRulesDeps[group], function(rule) {
                if (self.rules[rule] !== 'undefined') {
                    delete self.rules[rule];
                }
            });
        }
    }


    Button.$inject = ['ButtonState'];

    function Button(ButtonState) {

        var selectors = ['hover', 'active', 'focus', 'disabled'];

        function ButtonConstructor(modifier) {
            this.modifier = modifier || null;
            this.common = null;

            for (var i = 0; i < selectors.length; i++) {
                this[selectors[i]] = null;
            }
        }

        ButtonConstructor.prototype = {
            addState: addState,
            cleanState: cleanState,
            toggleSelector: toggleSelector,
            getSelectors: getSelectors,
            getActiveSelectors: getActiveSelectors
        };

        return ButtonConstructor;

        function addState(state) {
            if (this.hasOwnProperty(state)) {
                this[state] = new ButtonState();
                return this[state];
            }
            return false;
        }

        function cleanState(state) {
            if (this.hasOwnProperty(state)) {
                this[state] = null;
                return true;
            }
            return false;
        }

        function toggleSelector(selector) {
            if (selectors.indexOf(selector) >= 0) {
                if (this[selector] === null) {
                    return this.addState(selector);
                } else {
                    return this.cleanState(selector);
                }
            }
        }

        function getSelectors() {
            return selectors;
        }

        function getActiveSelectors() {
            var active = [];
            for (var i = 0; i < selectors.length; i++) {
                if (this[selectors[i]] !== null) {
                    active.push(selectors[i]);
                }
            }
            return active;
        }
    }


    ButtonService.$inject = ['$http', 'Button'];

    function ButtonService($http, Button) {

        var options = {
            className: 'button',
            separator: '_'
        };
        var buttons = [];

        return {
            getAll: getAll,
            getOptions: getOptions,
            addButton: addButton,
            setSilentRule: setSilentRule,
            toggleButtonSelector: toggleButtonSelector,
            loadJSON: loadJSON,
            renameClass: renameClass
        };


        function getAll() {
            return buttons;
        }

        function getOptions() {
            return options;
        }

        function loadJSON(param) {

            addButton().addState('common').toggleGroup('size');
            buttons[0].addState('hover').toggleGroup('fill');

            /*$http.get('data/' + param + '.json').success(function(json) {
                angular.forEach(json.button, function(btn) {
                    addButton(btn.classname, btn.role).update(btn);
                });
            });*/
        }

        function addButton(modifier) {
            var button = new Button(modifier);
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

    }
})();