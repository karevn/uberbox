// Generated by CoffeeScript 1.8.0
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Uberbox.Item = (function(_super) {
    __extends(Item, _super);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.defaults = {
      description_style: 'bottom'
    };

    Item.prototype.shareUrls = {
      facebook: function() {
        return "//www.facebook.com/share.php?v=4&src=bm&u=%url%";
      },
      twitter: function() {
        return "//twitter.com/home?status=%url%";
      },
      googleplus: function() {
        return "//plus.google.com/share?url=%url%";
      },
      reddit: function() {
        return "//reddit.com/submit?url=%url%";
      },
      digg: function() {
        return "//digg.com/submit?phase=2&url=%url%}";
      },
      delicious: function() {
        return "//delicious.com/post?url=";
      },
      pinterest: function() {
        return "//www.pinterest.com/pin/create/button/?url=%url%&description=%title%";
      },
      vk: function() {
        return "http://vk.com/share.php?url=%url%";
      }
    };

    Item.prototype.initialize = function() {
      Item.__super__.initialize.apply(this, arguments);
      if (this.get('share') && _.isBoolean(this.get('share'))) {
        return this.set('share', {
          facebook: true,
          twitter: true,
          googleplus: true,
          reddit: true,
          digg: true,
          delicious: true,
          pinterest: true,
          vk: true
        });
      }
    };

    Item.prototype.activate = function() {
      if (this.collection.activeItem !== this) {
        return this.trigger('activate', this);
      }
    };

    Item.prototype.deactivate = function() {
      return this.trigger('deactivate');
    };

    Item.prototype.next = function() {
      return this.collection.next(this);
    };

    Item.prototype.prev = function() {
      return this.collection.prev(this);
    };

    Item.prototype.isActive = function() {
      return this.collection.activeItem === this;
    };

    Item.prototype.isNext = function() {
      return this.collection.activeItem === this.prev();
    };

    Item.prototype.isPrev = function() {
      return this.collection.activeItem === this.next();
    };

    Item.prototype.processPseudotags = function(template) {
      var tag, tags;
      tags = {
        url: window.location.href,
        title: this.get('title'),
        description: this.get('description')
      };
      for (tag in tags) {
        template = template.replace("%" + tag, encodeURIComponent(tags[tag]));
      }
      return template;
    };

    Item.prototype.getShareLinkUrl = function(service) {
      var config, urlTemplate;
      config = this.get('share')[service];
      if (config.url) {
        return config.url;
      }
      urlTemplate = this.shareUrls[service]();
      return this.processPseudotags(urlTemplate);
    };

    return Item;

  })(Backbone.Model);

  Uberbox.ItemCollection = (function(_super) {
    __extends(ItemCollection, _super);

    function ItemCollection() {
      return ItemCollection.__super__.constructor.apply(this, arguments);
    }

    ItemCollection.prototype.model = Uberbox.Item;

    ItemCollection.prototype.current = null;

    ItemCollection.prototype.initialize = function() {
      ItemCollection.__super__.initialize.apply(this, arguments);
      return this.on('activate', (function(_this) {
        return function(item) {
          if (_this.activeItem) {
            _this.activeItem.deactivate();
          }
          return _this.activeItem = item;
        };
      })(this));
    };

    ItemCollection.prototype.next = function(item) {
      var index;
      index = this.indexOf(item);
      if (index === this.length - 1) {
        return null;
      }
      return this.at(index + 1);
    };

    ItemCollection.prototype.prev = function(item) {
      var index;
      index = this.indexOf(item);
      if (index === 0) {
        return;
      }
      return this.at(index - 1);
    };

    ItemCollection.prototype.activateNext = function() {
      if (this.current && this.current.next()) {
        return this.current.next().activate();
      }
    };

    ItemCollection.prototype.activatePrev = function() {
      if (this.current && this.current.prev()) {
        return this.current.prev().activate();
      }
    };

    return ItemCollection;

  })(Backbone.Collection);

}).call(this);
