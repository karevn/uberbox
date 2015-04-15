// Generated by CoffeeScript 1.8.0
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Uberbox.ToolbarView = (function(_super) {
    __extends(ToolbarView, _super);

    function ToolbarView() {
      return ToolbarView.__super__.constructor.apply(this, arguments);
    }

    ToolbarView.prototype.template = function() {
      return Uberbox.Templates.toolbar;
    };

    ToolbarView.prototype.getTemplate = function() {
      return this.template();
    };

    ToolbarView.prototype.ui = {};

    ToolbarView.prototype.events = {};

    ToolbarView.prototype.initialize = function() {
      ToolbarView.__super__.initialize.apply(this, arguments);
      this.render();
      return this.bindUIElements();
    };

    ToolbarView.prototype.serializeData = function() {
      return {
        model: this.model
      };
    };

    return ToolbarView;

  })(Marionette.ItemView);

}).call(this);