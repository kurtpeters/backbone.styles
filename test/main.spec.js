var _ = require('underscore'),
    jQuery = require('jquery'),
    Backbone = require('backbone'),
    cheerio = require('cheerio'),
    expect = require('chai').expect,
    $ = cheerio.load('<div id="test"></div>');

Backbone.Styles = require('../src/backbone.styles');

describe('Backbone.Styles', function () {
    it('should exist', function () {
        expect(Backbone.Styles).to.be.a('function');
    });
});