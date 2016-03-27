//

;(function( global ) {

    var _defaultRules = {
        'height': 30,
        'line-height': 30,
        'padding-left': 15,
        'padding-right': 15,
        'padding-top': 0,
        'padding-bottom': 0,
        'background': '#4980b7',
        'border-color': '#2f4255',
        'border': 1,
        'font-size': 14,
        'color': '#fff',
        'border-radius': 4,
        'box-shadow-color': 'rgba(0,0,0,0.2)',
        'box-shadow-x': 0,
        'box-shadow-y': 1,
        'box-shadow-blur': 4
    };

    function Rule(className, role) {
        this.rules = {};
        this.className = className;
        this.role = role;
    }

    Rule.prototype.setRule = function( rule, value ) {
        if (value) {
            this.rules[rule] = value;
        } else {
            delete this.rules[rule];
        }
    };

    Rule.prototype.setGroupRules = function( group, remove ) {
        var groupKeys = {
                'size': ['height', 'line-height', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom'],
                'fill': ['background'],
                'font': ['font-size', 'color'],
                'uppercase': ['text-transform'],
                'border': ['border', 'border-color'],
                'radius': ['border-radius'],
                'shadow': ['box-shadow-color', 'box-shadow-x', 'box-shadow-y', 'box-shadow-blur']
            },
            keys = groupKeys[group];

        keys.forEach(function( rule ) {
            if ( remove ) {
                delete this.rules[rule];
            } else {
                this.rules[rule] = _defaultRules[rule];
            }
        }, this);

        if ( remove ) {
            Dashboard.removeRules(this.className, this.role, group);
        } else {
            Dashboard.appendRules(this.className, this.role, group);
        }
    };


    var cssrule = function(className, role) {
        return new Rule(className, role);
    };

    global.cssrule = cssrule;

})( this );


;(function( global ) {
    var Dashboard = (function() {

        var section = {};

        return {
            appendButton: function(className, role) {
                var _role = {},
                    pseudo = role != 'common' ? '_pseudo' : '';
                tpl_section = tmpl('tmpl_button'+pseudo, {
                    className: className,
                    role: role
                });

                if (section[className] == undefined) {
                    section[className] = {};
                }
                section[className][role] = $(tpl_section);

                $('.builder-dashboard').append(section[className][role]);
            },

            appendRules: function(className, role, rule) {
                var tpl_rules = tmpl('tmpl_rules_'+rule, {}),
                    $tpl = $(tpl_rules);
                console.log(section);

                section[className][role].find('.section-rules').append($tpl);

                if (rule == 'radius') {
                    $('input[type="range"]', $tpl).rangeslider({
                        polyfill: false,

                        rangeClass: 'rangeslider',
                        disabledClass: 'rangeslider_disabled',
                        horizontalClass: 'rangeslider_horizontal',
                        verticalClass: 'rangeslider_vertical',
                        fillClass: 'rangeslider-fill',
                        handleClass: 'rangeslider-handle',
                        onSlide: function(position, value) {
                            var name = this.$element.data('tracked'),
                                input = this.$element.parents('.builder-rule').find('input[name='+name+']');

                            input.val(value).change();
                        }
                    });
                }
            },

            removeRules: function(className, role, rule) {
                section[className][role].find('.builder-rule_'+rule).remove();

            }
        };
    })();

    var cache = {};

    function tmpl(str, data){
        // Выяснить, мы получаем шаблон или нам нужно его загрузить
        // обязательно закешировать результат
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :

            // Сгенерировать (и закешировать) функцию,
            // которая будет служить генератором шаблонов
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Сделать данные доступными локально при помощи with(){}
                "with(obj){p.push('" +

                    // Превратить шаблон в чистый JavaScript
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")
                + "');}return p.join('');");

        // простейший карринг(термин функ. прог. - прим. пер.)
        // для пользователя
        return data ? fn( data ) : fn;
    };

    global.Dashboard = Dashboard;

})( this );


/**
 * BUTTON Generator MODULE
 *
 * */
;(function( global ) {
    var Button = (function() {

        var buttons = {},
            units = 'px',
            separator = '_',
            styles,
            baseClassName;


        return {

            generateStyles: function() {
                styles = '';

                for (className in buttons) {
                    for (role in buttons[className]) {
                        styles += this.generateStyle( className, role, buttons[className][role]['rules'] );
                    }
                }

                return this;
            },

            generateStyle: function(className, pseudoClass, button_rules) {
                var tab = '    ',
                    _styles = '',
                    classNameRender = pseudoClass != 'common' ? className+':'+pseudoClass : className;

                _styles += '.' + classNameRender + ' {\n';

                if (pseudoClass == 'common') {
                    _styles += tab + 'box-sizing: border-box;\n';
                    _styles += tab + 'display: inline-block;\n';
                    _styles += tab + 'cursor: pointer;\n';
                    _styles += tab + 'outline: none;\n';
                }

                // Size
                if ( button_rules['height'] ) {
                    var line_height = (button_rules['border']) ? button_rules['line-height'] - button_rules['border'] * 2 : button_rules['line-height'];

                    _styles += tab + 'height: ' + button_rules['height'] + units + ';\n';
                    _styles += tab + 'line-height: ' + line_height + units + ';\n';

                    if ( button_rules['padding'] ) {
                        button_rules['padding-right'] = button_rules['padding'];
                        button_rules['padding-left'] = button_rules['padding'];
                    }
                    _styles += tab + 'padding: ' + button_rules['padding-top'] + units + ' ' + button_rules['padding-right'] + units + ' ' + button_rules['padding-bottom'] + units + ' ' + button_rules['padding-left'] + units + ';\n';
                }

                // Fill
                if ( button_rules['background'] ) {
                    _styles += tab + 'background: ' + button_rules['background'] + ';\n';
                }

                // Border
                if ( button_rules['border'] && button_rules['border'] != 0 ) {
                    _styles += tab + 'border: ' + button_rules['border'] + units + ' solid ' + button_rules['border-color'] + ';\n';
                } else if (pseudoClass == 'common') {
                    _styles += tab + 'border: none;\n';
                }

                // Radius
                if ( button_rules['border-radius'] ) {
                    _styles += tab + 'border-radius: ' + button_rules['border-radius'] + units + ';\n';
                }


                // Font
                if ( button_rules['font-size'] && button_rules['color'] ) {
                    _styles += tab + 'font-size: ' + button_rules['font-size'] + units + ';\n';
                    _styles += tab + 'color: ' + button_rules['color'] + ';\n';
                }

                if ( button_rules['font-weight'] ) {
                    _styles += tab + 'font-weight: ' + button_rules['font-weight'] + ';\n';
                }
                if ( button_rules['font-style'] ) {
                    _styles += tab + 'font-style: ' + button_rules['font-style'] + ';\n';
                }
                if ( button_rules['text-transform'] ) {
                    _styles += tab + 'text-transform: ' + button_rules['text-transform'] + ';\n';
                }

                _styles += '}\n';

                return _styles;
            },

            renderStyles: function() {
                $('.preview-code').html(styles);
                $('#dynamic-css').html(styles);
            },

            newButton: function(className) {
                if ( baseClassName == null ) {
                    baseClassName = className;
                } else {
                    className = baseClassName + separator + className;
                }
                buttons[className] = { 'common': cssrule(className, 'common') };
                Dashboard.appendButton(className, 'common');
            },

            renameClass: function(className, newClassName) {
                if (!buttons[newClassName]) {
                    buttons[newClassName] = buttons[className];
                    delete buttons[className];
                    if ( className == baseClassName ) {
                        baseClassName = newClassName;
                    }
                }
            },

            addPseudoClass: function(className, role) {
                buttons[className][role] = cssrule(className, role);
                Dashboard.appendButton(className, role);
            },

            get: function(className, role) {
                return !role ? buttons[className] : buttons[className][role];
            },

            setUnits: function(u) {
                units = u;
            }
        };
    })();

    global.Button = Button;

})( this );


$(function() {

    var dashboard = $('.builder-dashboard');
    var colorPicker = new ColorPicker();

    Button.newButton('button');
    Button.addPseudoClass('button', 'hover');

    Button.generateStyles();
    Button.renderStyles();


    dashboard.on('change input', '.js-rule-trigger', function( ev ) {
        ev.preventDefault();

        var el = $(this),
            rule = el.attr('name'),
            value = el.val(),
            section = el.parents('.builder-section'),
            buttonClass = section.data('button-class'),
            role = section.data('role');

        Button.get(buttonClass, role).setRule(rule, value);

        Button.generateStyles();
        Button.renderStyles();

        //console.log(Button.get(buttonClass, 'common').rules);

    });

    dashboard.on('click', '.js-check-rules li', function( ev ) {
        var el = $(this),
            section = el.parents('.builder-section'),
            className = section.data('button-class'),
            role = section.data('role'),
            rulesName = el.data('rules');

        Button.get(className, role).setGroupRules(rulesName, el.hasClass('is-selected'));

        Button.generateStyles();
        Button.renderStyles();

        el.toggleClass('is-selected');
    });

    dashboard.on('click', '.js-silent-trigger', function() {
        var $this = $(this),
            rule = $this.data('rule'),
            value = $this.data('value'),
            section = $this.parents('.builder-section'),
            className = section.data('button-class'),
            role = section.data('role');

        if ($this.hasClass('is-checked')) value = false;

        Button.get(className, role).setRule(rule, value);

        Button.generateStyles();
        Button.renderStyles();

        $this.toggleClass('is-checked');
    });

    dashboard.on('click', '.js-pick-color', function(e) {
        var input = $(this).find('input'),
            color = input.val(),
            target = input.attr('name');
        colorPicker.attach(input, color);
    });

});



(function( global ) {

    function ColorPicker() {
        this.target = null;
        this.pickerPopup = $('.popup-colorPicker');

        this.singleColorCanvas = $('#js-spectrum-color').get(0);
        this.singleColorContext = this.singleColorCanvas.getContext('2d');

        this.allColorCanvas = $('#js-spectrum-all').get(0);
        this.allColorContext = this.allColorCanvas.getContext('2d');

        this.createMultiColorSpectrum();
        this.createSingleColorSpectrum();
    }

    ColorPicker.prototype.show = function() {
        this.pickerPopup.show();
    };

    ColorPicker.prototype.hide = function() {
        this.pickerPopup.hide();
    };

    ColorPicker.prototype.attach = function(target, color) {
        var self = this;
        this.target = target;
        this.setColor(color);

        $('.js-color-choose').click(function(e) {
            var color = $('#js-color-input').val();
            self.chooseColor(color);
        });

        this.show();
    };

    ColorPicker.prototype.setColor = function(color) {
        if (color.search("rgb") != -1) {
            var rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            //this.createSingleColorSpectrum(color);
            color = rgbToHex(+rgb[1], +rgb[2], +rgb[3]);
        }
        $('#js-color-input').val(color);
        $('#js-color-selected').css('background', color);
    };

    ColorPicker.prototype.chooseColor = function(color) {
        this.target.val(color).change();
        this.target.parent('.js-pick-color').css('background', color);

        this.hide();
    };

    ColorPicker.prototype.createSingleColorSpectrum = function(color) {
        var canvas = this.singleColorCanvas;
        var ctx = this.singleColorContext;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if(!color) color = '#f00';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        whiteGradient.addColorStop(0, "rgba(255,255,255,1)");
        whiteGradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = whiteGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        blackGradient.addColorStop(0, "rgba(0,0,0,0)");
        blackGradient.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = blackGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        $(canvas).on('click', this.spectrumClick.bind(this));

        //$(canvas).on('mouseup', this.spectrumClick.bind(this));
    };

    ColorPicker.prototype.createMultiColorSpectrum = function() {
        var canvas = this.allColorCanvas;
        var ctx = this.allColorContext;

        var hueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        hueGradient.addColorStop(0.00, "#ff0000");
        hueGradient.addColorStop(0.17, "#ff00ff");
        hueGradient.addColorStop(0.33, "#0000ff");
        hueGradient.addColorStop(0.50, "#00ffff");
        hueGradient.addColorStop(0.67, "#00ff00");
        hueGradient.addColorStop(0.83, "#ffff00");
        hueGradient.addColorStop(1.00, "#ff0000");

        ctx.fillStyle = hueGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        $(canvas).on('click', this.hueClick.bind(this));
    };

    ColorPicker.prototype.hueClick = function(e) {
        var y = e.pageY - $(e.currentTarget).offset().top;
        var imgData = this.allColorContext.getImageData(0, y, 1, 1).data;
        this.createSingleColorSpectrum('rgb('+imgData[0]+', '+imgData[1]+', '+imgData[2]+')');
    };

    ColorPicker.prototype.spectrumClick = function(e) {
        var x = e.pageX - $(e.currentTarget).offset().left;
        var y = e.pageY - $(e.currentTarget).offset().top;
        var imgData = this.singleColorContext.getImageData(x, y, 1, 1).data;
        var color = rgbToHex(imgData[0], imgData[1], imgData[2]);

        this.setColor(color);
        //this.chooseColor(color);
    };

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    global.ColorPicker = ColorPicker;

})( this );