// Generated by CoffeeScript 1.8.0
(function() {
  var Uberbox,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Uberbox = (function(_super) {
    __extends(Uberbox, _super);

    Uberbox.instances = [];

    Uberbox.prototype.template = function() {
      return Uberbox.Templates.uberbox;
    };

    Uberbox.prototype.regions = {
      lightbox: '.uberbox-lightbox-wrapper',
      carousel: '.uberbox-carousel-wrapper'
    };

    Uberbox.prototype.ui = {};

    Uberbox.contentViewTypes = function() {
      return {
        image: {
          condition: /\.(gif|png|jpeg|jpg)$/i,
          "class": Uberbox.ImageObjectView
        },
        audio: {
          condition: /\.(mp3|ogg)$/i,
          "class": Uberbox.AudioObjectView
        },
        youtube: {
          condition: /((\(\/\/)?(www\.)?youtube\.com\/watch\?v=.+)|((\/\/)(www\.)?youtu\.be\/.*)/i,
          "class": Uberbox.YoutubeObjectView
        },
        vimeo: {
          condition: /(\/\/)?vimeo\.com\/\d+121137859/i,
          "class": Uberbox.VimeoObjectView
        },
        iframe: {
          condition: /(\/|\.html|\.htm|\.php|.aspx)$/i,
          "class": Uberbox.IframeObjectView
        },
        gmap: {
          condition: /(google\.(\w+)\/maps\/)|(maps\.google\.(\w+))|(goo\.gl\/maps\/)/i,
          "class": Uberbox.GoogleMapsObjectView
        },
        unknown: {
          "class": Uberbox.UnknownItemView
        }
      };
    };

    Uberbox.show = function(items, options) {
      var uberbox;
      if (options == null) {
        options = {};
      }
      options = _.extend({
        current: 0,
        orientation: 'vertical',
        collection: new Uberbox.ItemCollection(items),
        carousel: false
      }, options);
      if (!(items && items.length > 0)) {
        return;
      }
      this.instances.push(uberbox = new Uberbox(options));
      return uberbox;
    };

    Uberbox.close = function() {
      var instance;
      if (this.instances.length > 0) {
        instance = this.instances.pop();
        return instance.remove();
      }
    };

    Uberbox.getPixelRatio = function() {
      if (window.devicePixelRatio > 0) {
        return window.devicePixelRatio;
      } else {
        return 1;
      }
    };

    Uberbox.getObjectViewType = function(item) {
      var condition, config, type, _ref;
      if (type = item.get('type')) {
        return Uberbox.contentViewTypes[type];
      }
      _ref = Uberbox.contentViewTypes();
      for (type in _ref) {
        config = _ref[type];
        condition = false;
        if (config.condition) {
          if (_.isRegExp(config.condition)) {
            condition = item.get('url').match(config.condition);
          }
          if (_.isFunction(config.condition)) {
            condition = config.condition(item);
          }
        } else {
          condition = true;
        }
        if (condition) {
          return config["class"];
        }
      }
    };

    function Uberbox(options) {
      this.onKeyDown = __bind(this.onKeyDown, this);
      Uberbox.__super__.constructor.call(this, _.extend({
        el: jQuery('<div class="uberbox" />').appendTo(jQuery('body'))
      }, options));
    }

    Uberbox.prototype.initialize = function() {
      var lightboxOptions;
      Uberbox.__super__.initialize.apply(this, arguments);
      this.render();
      this.bindUIElements();
      this.$el.addClass("uberbox-" + (this.getOption('orientation')));
      this.showOverlay();
      lightboxOptions = _.clone(this.options);
      delete lightboxOptions.el;
      this.lightbox.show(new Uberbox.Lightbox(lightboxOptions));
      this.listenTo(this.lightbox.currentView, 'close', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
      if (this.getOption('carousel')) {
        this.$el.addClass('uberbox-has-carousel');
        this.carousel.show(new Uberbox.Carousel(lightboxOptions));
      }
      this.getOption('collection').at(this.getOption('current')).activate();
      return jQuery('body').on('keydown.uberbox', this.onKeyDown);
    };

    Uberbox.prototype.remove = function() {
      Uberbox.__super__.remove.apply(this, arguments);
      this.ui.overlay.removeClass('visible');
      jQuery('body').off('keydown.uberbox', this.onKeyDown);
      return setTimeout(((function(_this) {
        return function() {
          return _this.ui.overlay.remove();
        };
      })(this)), 600);
    };

    Uberbox.prototype.onKeyDown = function(e) {
      if (e.which === 27) {
        e.preventDefault();
        this.remove();
      }
      if (e.which === 37 || e.which === 38) {
        this.collection.activatePrev();
        return false;
      }
      if (e.which === 40 || e.which === 39) {
        this.collection.activateNext();
        return false;
      }
    };

    Uberbox.prototype.showOverlay = function() {
      this.ui.overlay = jQuery('<div class="uberbox-overlay" />').appendTo(jQuery('body'));
      _.defer((function(_this) {
        return function() {
          return _this.ui.overlay.addClass('visible');
        };
      })(this));
      return this.ui.overlay.on('click', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
    };

    return Uberbox;

  })(Marionette.LayoutView);

}).call(this);