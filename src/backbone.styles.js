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
            this.mixinRules = {};
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

        "generateCSS": function(jscss, parent) {
            var rules = '';
            // if parent exist, remove and add as prefix to current selector
            if (jscss['@parent']) {
                parent = jscss['@parent'] + ' ' + parent;
                jscss = _(jscss).omit('@parent');
                return this.generateCSS(jscss, parent);
            }
            _(jscss).each(function(rule, property) {
                if (/^@mixin/.test(property)) {
                    rules += this.generateCSS(this.useMixin(property, rule), parent);
                    return;
                }
                if (_.isObject(rule)) {
                    this.processFromJSCSS(rule, parent, property);
                    return;
                }
                rules += property + ':' + rule + ';';
            }, this);
            return rules;
        },

        "useMixin": function(mixin, args) {
            mixin = this.mixinRules[mixin.replace(/^@mixin:/, '')];
            args = args.replace(/\s+|\(|\)/g, '').split(',');
            if (!args[0]) {
                args = [];
            }
            if (!mixin) {
                return '';
            }
            return _.isFunction(mixin) ? mixin.apply(this, args) : mixin;
        },

        "process": function(jscss, parent) {
            var rules = this.generateCSS(jscss, parent);
            if (rules) {
                this.sheet.addRule(parent, rules);
            }
        },

        "processFromJSCSS": function(rules, parent, el) {
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

        "registerMixin": function(mixinRule, value) {
            styles.mixinRules[mixinRule] = value;
        }

    });

})();
