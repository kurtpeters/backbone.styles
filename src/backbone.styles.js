(function (factory) {
    'use strict';
    if (typeof define === 'function' && typeof define.amd === 'object') {
        define(['underscore', 'backbone'], function (_, Backbone) {
            factory(_, Backbone);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        var _ = require('underscore'),
            Backbone = require('backbone');
        module.exports = factory.bind(null, _, Backbone);
    } else if (typeof window !== 'undefined') {
        factory();
    }
})(function(_, Backbone) {

    'use strict';
    _ = _ || window._;
    Backbone = Backbone || window.Backbone;

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
            this.variables = {};
            this.virtualStyleSheet = {};
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

        "extractChildSelectors": function(jscss, selector) {
            var vss = {};
            _(jscss).each(function(rule, property) {
                if (_.isObject(rule)) {
                    this.processFromJSCSS(rule, selector, property);
                    return;
                }
                if (/^\$/.test(property)) {
                    this.variables[property.replace('$', '')] = rule;
                    return;
                }
                vss[property] = rule;
            }, this);
            return vss;
        },

        "generateCSS": function(jscss, selector) {
            var rules = '';
            _(jscss).each(function(rule, property) {
                if (/^@mixin/.test(property)) {
                    this.process(this.useMixin(property, rule), selector);
                    return;
                }
                rules += property + ':' + rule + ';';
            }, this);
            return this.interpolate(rules);
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

        "interpolate": function(rules) {
            var regexp = /\$((\w|\-|\_)+)/g;
            if (regexp.test(rules)) {
                rules = rules.replace(regexp, _.bind(function(variable, match) {
                    return this.variables[match] || variable;
                }, this));
            }
            return rules;
        },

        "process": function(jscss, selector) {
            // if parent exist, remove and add as prefix to current selector
            if (jscss['@parent']) {
                selector = jscss['@parent'] + ' > ' + selector;
                jscss = _(jscss).omit('@parent');
            }

            var rules = this.extractChildSelectors(jscss, selector),
                vss = this.virtualStyleSheet[selector],
                css;

            if (_.isEqual(rules, vss)) {
                return;
            }

            rules = _.extend({}, vss, rules);
            css = this.generateCSS(rules, selector);

            if (css) {
                this.virtualStyleSheet[selector] = rules;
                this.sheet.addRule(selector, css);
            }
        },

        "processFromJSCSS": function(rules, selector, el) {
            if (/^&/.test(el)) {
                return this.process(rules, selector + el.replace('&', ''));
            }
            if (/^@root/.test(el)) {
                return this.process(rules);
            }
            if (/^@el/.test(el)) {
                // inline styles
            }
            this.process(rules, selector ? selector + ' ' + el : el);
        },

        "processFromView": function(view) {
            var className = view.className ? '.' + view.className.replace(/\s+/g, '.') : '',
                jscss = {},
                selector = view.tagName + className,
                viewStyles = view.styles;
            jscss = _.isFunction(viewStyles) ? viewStyles.call(view) : viewStyles;
            this.process(jscss, selector);
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
        },

        "$": function(name, value) {
            var variables = {};
            if (_.isString(name)) {
                variables[name] = value;
            } else {
                variables = name;
            }
            _.extend(styles.variables, variables);
        },

        "toJSON": function() {
            return _.clone(styles.virtualStyleSheet);
        }

    });

});
