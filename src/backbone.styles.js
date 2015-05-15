(function() {

    'use strict';

    function _addRule(selectorText, cssText, index) {
        if (index === void 0) {
            index = (this.cssRules || []).length;
        }
        this.insertRule(selectorText + ' {' + cssText + '}', index);
    }

    function Styles() {
        this.initialize();
    }

    _.extend(Styles.prototype, {

        "initialize": function() {
            this.mixins = {};
            this.extend = {};
            this.attributes = {};
            this.injectStyleSheet();
        },

        "createStyleSheet": function(id) {
            var el = document.createElement('style');
            el.type = 'text/css';
            el.setAttribute('id', id);
            return el;
        },

        "injectStyleSheet": function() {
            var el = this.createStyleSheet('backbone-styles');
            $('head').append(el);
            this.sheet = el.sheet ? el.sheet : el.styleSheet;
            if (this.sheet.addRule === void 0) {
                this.sheet.addRule = _addRule;
            }
            if (this.sheet.removeRule === void 0) {
                this.sheet.removeRule = this.sheet.deleteRule;
            }
        },

        "route": function(rules, parent, el) {
            if (/^&/.test(el)) {
                return this.process(rules, parent + el.replace('&', ''));
            }
            if (/^@root/.test(el)) {
                return this.process(rules);
            }
            if (/^@el/.test(el)) {
                // inline styles
            }
            this.process(rules, parent ? parent + ' ' + el : el);
        },

        "process": function(jscss, parent) {
            var rules = '';
            if (jscss['@parent']) {
                parent = jscss['@parent'] + ' ' + parent;
                jscss = _(jscss).omit('@parent');
                return this.process(jscss, parent);
            }
            _(jscss).each(function(rule, property) {
                if (rule instanceof Object) {
                    return this.route(rule, parent, property);
                }
                rules += property + ':' + rule + ';';
            }, this);
            if (rules) {
                this.sheet.addRule(parent, rules);
            }
        },

        "processFromView": function(view) {
            var className = view.className ? '.' + view.className.replace(/\s+/g, '.') : void 0,
                jscss = {},
                selector = view.tagName + className;
            jscss[selector] = view.styles;
            this.process(jscss);
        }

    });

    var baseConstructor = Backbone.View.prototype.constructor,
        styles = new Styles();

    Backbone.View = Backbone.View.extend({
        "constructor": function() {
            var view = baseConstructor.apply(this, arguments);
            styles.processFromView(this);
            return view;
        },
        "styles": {}
    });

    Backbone.Styles = function(jscss) {
        styles.process(jscss);
    };

    _.extend(Backbone.Styles, {

        "mxn": function() {

        },

        "ext": function() {

        },

        "set": function() {

        }

    });

})();
