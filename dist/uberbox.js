// Uberbox.js
// version: 0.1.0
// author: Nikolay Karev
// license: MIT
(function(root, factory) {
    // Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery', 'backbone', 'backbone.marionette'], function(_, $, backbone, marionette) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.Uberbox = factory(root, _, $, backbone, marionette);
        });

        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    } else if (typeof exports !== 'undefined') {
        var _ = require('underscore');
        var backbone = require('backbone');
        var marionette = require('marionette');
        var jquery = require('jquery');
        factory(root, _, jquery, backbone, marionette);

        // Finally, as a browser global.
    } else {
        root.Uberbox = factory(root, root._, (root.uberboxjQuery || root.jQuery || root.Zepto || root.ender || root.$), Backbone, Marionette);
    }

}(this, function(root, _, jQuery, Backbone, Marionette) {
    var Uberbox,
        __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    Uberbox = (function(_super) {
        __extends(Uberbox, _super);

        Uberbox.instances = [];

        Uberbox.prototype.template = function() {
            return Uberbox.Templates.uberbox;
        };

        Uberbox.prototype.regions = {
            lightbox: '.uberbox-lightbox-wrapper',
            carousel: '.uberbox-carousel-wrapper',
            toolbar: '.uberbox-toolbar-wrapper'
        };

        Uberbox.prototype.ui = {};

        Uberbox.contentViewTypes = function() {
            return {
                image: {
                    condition: /\.(gif|png|jpeg|jpg)$/i,
                    "class": Uberbox.ImageObjectView
                },
                youtube: {
                    condition: /((\(\/\/)?(www\.)?youtube\.com\/watch\?v=.+)|((\/\/)(www\.)?youtu\.be\/.*)/i,
                    "class": Uberbox.YoutubeObjectView
                },
                vimeo: {
                    condition: /(\/\/)?vimeo\.com\/\d+/i,
                    "class": Uberbox.VimeoObjectView
                },
                soundcloud: {
                    condition: /soundcloud\.com/i,
                    "class": Uberbox.SoundcloudObjectView
                },
                bandcamp: {
                    condition: /bandcamp\.com/i,
                    "class": Uberbox.BandcampObjectView
                },
                iframe: {
                    condition: /(\/|\.html|\.htm|\.php|.aspx)$/i,
                    "class": Uberbox.IframeObjectView
                },
                gmap: {
                    condition: /(google\.(\w+)\/maps\/)|(maps\.google\.(\w+))|(goo\.gl\/maps\/)/i,
                    "class": Uberbox.GoogleMapsObjectView
                },
                html: {
                    condition: function(item) {
                        return !!item.get('html');
                    },
                    "class": Uberbox.HTMLObjectView
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
            jQuery('html').css('');
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
            var condition, config, type, url, _ref;
            if (type = item.get('type')) {
                return Uberbox.contentViewTypes[type];
            }
            _ref = Uberbox.contentViewTypes();
            for (type in _ref) {
                config = _ref[type];
                condition = false;
                if (config.condition) {
                    if (_.isRegExp(config.condition) && (url = item.get('url'))) {
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
            var current, lightboxOptions;
            Uberbox.__super__.initialize.apply(this, arguments);
            this.render();
            this.bindUIElements();
            this.$el.addClass("uberbox-" + (this.getOption('orientation')));
            this.showOverlay();
            lightboxOptions = _.extend({}, this.options, {
                root: this.$el
            });
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
            } else {
                this.$('.uberbox-carousel-wrapper').remove();
            }
            current = this.getOption('collection').at(this.getOption('current'));
            this.listenTo(this.getOption('collection'), 'activate', this.onItemActivated);
            current.activate();
            jQuery('body').on('keydown.uberbox', this.onKeyDown);
            this.overflow = jQuery('html').css('overflow');
            return jQuery('html').css('overflow', 'hidden');
        };

        Uberbox.prototype.onItemActivated = function(model) {
            if (this.toolbar.currentView) {
                jQuery(window).off('resize.uberbox-main');
                this.toolbar.empty();
            }
            this.toolbar.show(new Uberbox.ToolbarView({
                model: model,
                bindTo: this.lightbox.currentView
            }));
            this.listenTo(this.toolbar.currentView, 'close', (function(_this) {
                return function() {
                    return _this.remove();
                };
            })(this));
            return jQuery(window).on('resize.uberbox-main', (function(_this) {
                return function() {
                    return _this.toolbar.currentView.layout();
                };
            })(this));
        };

        Uberbox.prototype.remove = function() {
            Uberbox.__super__.remove.apply(this, arguments);
            if (Uberbox.Utils.isFullscreen()) {
                Uberbox.Utils.exitFullscreen();
            }
            this.ui.overlay.removeClass('visible');
            jQuery('body').off('keydown.uberbox', this.onKeyDown);
            jQuery('html').css('overflow', this.overflow);
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

    Uberbox.Utils = (function() {
        function Utils() {}

        Utils.supportsFullScreen = function() {
            var el, prefix, _i, _len, _ref;
            el = document.documentElement;
            if (el.requestFullscreen) {
                return true;
            }
            _ref = ['moz', 'webkit', 'ms'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                prefix = _ref[_i];
                if (el["" + prefix + "RequestFullScreen"]) {
                    return true;
                }
            }
            return false;
        };

        Utils.isFullscreen = function() {
            var method, _i, _len, _ref;
            _ref = ['fullscreenEnabled', 'webkitFullscreenEnabled', 'mozFullscreenEnabled', 'msFullscreenEnabled'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                method = _ref[_i];
                if (_.isUndefined(document[method])) {
                    return document[method];
                }
            }
        };

        Utils.enterFullscreen = function(el) {
            var method;
            if (!el) {
                el = document.documentElement;
            }
            method = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
            return method.apply(el);
        };

        Utils.exitFullscreen = function() {
            var el, method;
            el = document.documentElement;
            method = el.exitFullscreen || el.mozCancelFullScreen || el.msExitFullscreen;
            if (method) {
                method.apply(el);
            }
            if (document.webkitExitFullscreen) {
                return document.webkitExitFullscreen();
            }
        };

        return Utils;

    })();

    var __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    Uberbox.ShareService = (function(_super) {
        __extends(ShareService, _super);

        function ShareService() {
            return ShareService.__super__.constructor.apply(this, arguments);
        }

        ShareService.services = {
            facebook: {
                url: "//www.facebook.com/share.php?v=4&src=bm&u=%url%",
                name: 'Facebook'
            },
            twitter: {
                url: "//twitter.com/home?status=%url%",
                name: 'Twitter'
            },
            googleplus: {
                url: "//plus.google.com/share?url=%url%",
                name: 'Google Plus'
            },
            reddit: {
                url: "//reddit.com/submit?url=%url%",
                name: 'Reddit'
            },
            digg: {
                url: "//digg.com/submit?phase=2&url=%url%",
                name: 'Digg'
            },
            stumbleupon: {
                url: "http://www.stumbleupon.com/submit?url=%url%&title=%title%",
                name: "Stumbleupon"
            },
            delicious: {
                url: "//delicious.com/post?url=",
                name: 'Delicious'
            },
            pinterest: {
                url: "//www.pinterest.com/pin/create/button/?url=%url%&description=%title%",
                name: 'Pinterest'
            },
            vk: {
                url: "http://vk.com/share.php?url=%url%",
                name: 'VK'
            }
        };

        ShareService.prototype.processPseudotags = function(template) {
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

        ShareService.prototype.getShareLinkUrl = function() {
            return this.processPseudotags(this.get('url'));
        };

        return ShareService;

    })(Backbone.Model);

    Uberbox.Item = (function(_super) {
        __extends(Item, _super);

        function Item() {
            return Item.__super__.constructor.apply(this, arguments);
        }

        Item.prototype.defaults = {
            description_style: 'bottom',
            download_tooltip: 'Download',
            share_tooltip: 'Share',
            fullscreen_tooltip: 'Fullscreen',
            exit_fullscreen_tooltip: 'Exit fullscreen'
        };

        Item.prototype.initialize = function() {
            var share;
            Item.__super__.initialize.apply(this, arguments);
            if (share = this.get('share')) {
                if (_.isBoolean(share)) {
                    share = Uberbox.ShareService.services;
                }
                return this.set('share', _.map(share, function(config, name) {
                    return new Uberbox.ShareService(_.extend({}, {
                        slug: name
                    }, config));
                }));
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

    var __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    Uberbox.SlidingWindowItem = (function(_super) {
        __extends(SlidingWindowItem, _super);

        function SlidingWindowItem() {
            this.onClicked = __bind(this.onClicked, this);
            return SlidingWindowItem.__super__.constructor.apply(this, arguments);
        }

        SlidingWindowItem.prototype.loaded = false;

        SlidingWindowItem.prototype.events = function() {
            return {
                click: 'onClicked'
            };
        };

        SlidingWindowItem.prototype.modelEvents = {
            activate: 'onItemActivated',
            deactivate: 'onItemDeactivated'
        };

        SlidingWindowItem.prototype.belongs = function() {
            return this.top > 0 && this.left > 0 && this.width + this.left < this.getParent().width() && this.top + this.height < this.getParent().height();
        };

        SlidingWindowItem.prototype.initialize = function() {
            SlidingWindowItem.__super__.initialize.apply(this, arguments);
            this.listenToOnce(this, 'load', (function(_this) {
                return function() {
                    _this.loaded = true;
                    _this.$el.addClass('uberbox-loaded');
                    if (_this.loaderTimeout) {
                        clearTimeout(_this.loaderTimeout);
                    }
                    return _this.hideLoader();
                };
            })(this));
            this.render();
            this.bindUIElements();
            if (this.showRegions) {
                return this.showRegions();
            }
        };

        SlidingWindowItem.prototype.getTemplate = function() {
            return this.getOption('template')();
        };

        SlidingWindowItem.prototype.getNextToScrollTo = function(item) {
            var next;
            if (this.model === item) {
                return this;
            }
            if (next = this.getOption('next')) {
                return next.getNextToScrollTo(item);
            }
            return null;
        };

        SlidingWindowItem.prototype.getPrevToScrollTo = function(item) {
            var next;
            if (this.model === item) {
                return this;
            }
            if (next = this.getOption('prev')) {
                return next.getPrevToScrollTo(item);
            }
            return null;
        };

        SlidingWindowItem.prototype.runAction = function(callback) {
            if (this.loaded) {
                return callback();
            } else {
                this.loaderTimeout = setTimeout(this.showLoader, 200);
                return this.listenToOnce(this, 'load', (function(_this) {
                    return function() {
                        return setTimeout(callback, 200);
                    };
                })(this));
            }
        };

        SlidingWindowItem.prototype.getParent = function() {
            if (!this.parent) {
                this.parent = this.$el.parent();
            }
            return this.parent;
        };

        SlidingWindowItem.prototype.remove = function() {
            this.$el.removeClass('uberbox-visible');
            if (this.getOption('next')) {
                this.getOption('next').options.prev = null;
            }
            if (this.getOption('prev')) {
                this.getOption('prev').options.next = null;
            }
            return setTimeout(((function(_this) {
                return function() {
                    return SlidingWindowItem.__super__.remove.call(_this);
                };
            })(this)), 600);
        };

        SlidingWindowItem.prototype.reveal = function() {
            return _.defer((function(_this) {
                return function() {
                    return _this.$el.addClass('uberbox-visible');
                };
            })(this));
        };

        SlidingWindowItem.prototype.bindUIElements = function() {
            SlidingWindowItem.__super__.bindUIElements.apply(this, arguments);
            if (this.model.collection.activeItem === this.model) {
                return this.onItemActivated();
            }
        };

        SlidingWindowItem.prototype.onItemActivated = function() {
            return this.$el.addClass('uberbox-current');
        };

        SlidingWindowItem.prototype.onItemDeactivated = function() {
            return this.$el.removeClass('uberbox-current');
        };

        SlidingWindowItem.prototype.onClicked = function() {
            return this.model.activate();
        };

        return SlidingWindowItem;

    })(Marionette.LayoutView);

    var __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    Uberbox.SlidingWindow = (function(_super) {
        __extends(SlidingWindow, _super);

        SlidingWindow.prototype.defaults = function() {
            return {
                orientation: 'vertical',
                current: 0
            };
        };

        function SlidingWindow(options) {
            SlidingWindow.__super__.constructor.call(this, _.extend({}, _.result(this, 'defaults'), options));
            this.listenTo(this.collection, 'activate', this.onItemActivated);
        }

        SlidingWindow.prototype.onShow = function() {
            return jQuery(window).on('resize.uberbox', this.layout);
        };

        SlidingWindow.prototype.remove = function() {
            jQuery(window).off('resize.uberbox', this.layout);
            return SlidingWindow.__super__.remove.apply(this, arguments);
        };

        SlidingWindow.prototype.getChildView = function(child) {
            var childView;
            return childView = this.getOption('childView') || this.constructor;
        };

        SlidingWindow.prototype.createChildView = function(child, options) {
            var view, viewClass;
            if (options == null) {
                options = {};
            }
            viewClass = this.getChildViewClass();
            options = _.extend(_.extend({
                model: child,
                orientation: this.getOption('orientation')
            }, Marionette._getValue(this.getOption('childViewOptions'), this, [child])), options);
            view = new viewClass(options);
            if (options.prev) {
                view.$el.insertAfter(options.prev.$el);
                view.layoutAsNext();
            } else if (options.next) {
                view.$el.insertBefore(options.next.$el);
                view.layoutAsPrev();
            } else {
                view.$el.appendTo(this.$el);
                view.layoutAsCurrent();
            }
            return view;
        };

        return SlidingWindow;

    })(Marionette.View);

    var __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    Uberbox.CarouselItem = (function(_super) {
        __extends(CarouselItem, _super);

        function CarouselItem() {
            this.onImageLoaded = __bind(this.onImageLoaded, this);
            return CarouselItem.__super__.constructor.apply(this, arguments);
        }

        CarouselItem.prototype.template = function() {
            return Uberbox.Templates['carousel-item'];
        };

        CarouselItem.prototype.className = 'uberbox-carousel-item';

        CarouselItem.prototype.padding = 15;

        CarouselItem.prototype.events = function() {
            return _.extend(CarouselItem.__super__.events.apply(this, arguments), {
                'load @ui.image': 'onImageLoaded'
            });
        };

        CarouselItem.prototype.ui = {
            image: 'img'
        };

        CarouselItem.prototype.getImageAspectRatio = function() {
            var aspect, image;
            image = this.ui.image[0];
            return aspect = image.naturalWidth / image.naturalHeight;
        };

        CarouselItem.prototype.getHeightInVerticalMode = function() {
            return this.width / this.getImageAspectRatio();
        };

        CarouselItem.prototype.getWidthInHorizontalMode = function() {
            return this.height * this.getImageAspectRatio();
        };

        CarouselItem.prototype.bindUIElements = function() {
            CarouselItem.__super__.bindUIElements.apply(this, arguments);
            if (this.ui.image[0].complete) {
                return _.defer((function(_this) {
                    return function() {
                        return _this.onImageLoaded();
                    };
                })(this));
            }
        };

        CarouselItem.prototype.onImageLoaded = function() {
            return this.trigger('load');
        };

        CarouselItem.prototype.layoutContent = function() {};

        CarouselItem.prototype.hideLoader = function() {};

        CarouselItem.prototype.layoutAsCurrent = function() {
            this.calculateCoordinatesAsCurrent();
            if (this.loaded) {
                this.layoutContent();
            }
            return this.applyLayout();
        };

        CarouselItem.prototype.layoutAsNext = function() {
            this.calculateCoordinatesAsNext();
            if (this.loaded) {
                this.layoutContent();
            }
            return this.applyLayout();
        };

        CarouselItem.prototype.layoutAsPrev = function() {
            this.calculateCoordinatesAsPrev();
            if (this.loaded) {
                this.layoutContent();
            }
            return this.applyLayout();
        };

        CarouselItem.prototype.fits = function() {
            var offset;
            if (this.belongs()) {
                return true;
            }
            offset = this.$el.offset();
            if (this.top < this.getParent().height() && offset.top + this.$el.height() > 0 && offset.left - this.$el.offsetParent().offset().left < this.getParent().width() && offset.left - this.$el.offsetParent().offset().left + this.$el.width() > 0) {
                return true;
            }
            return false;
        };

        CarouselItem.prototype.applyLayout = function() {
            return this.$el.css({
                left: this.left,
                top: this.top,
                width: this.width,
                height: this.height
            });
        };

        return CarouselItem;

    })(Uberbox.SlidingWindowItem);

    Uberbox.VerticalCarouselItem = (function(_super) {
        __extends(VerticalCarouselItem, _super);

        function VerticalCarouselItem() {
            return VerticalCarouselItem.__super__.constructor.apply(this, arguments);
        }

        VerticalCarouselItem.prototype.calculateCoordinatesAsPrev = function() {
            var next;
            next = this.getOption('next');
            this.left = this.padding;
            this.width = this.getParent().width() - this.padding * 2;
            this.height = this.getHeightInVerticalMode();
            return this.top = next.top - this.padding - this.height;
        };

        VerticalCarouselItem.prototype.calculateCoordinatesAsNext = function() {
            var prev;
            prev = this.getOption('prev');
            this.left = this.padding;
            this.top = this.padding + prev.top + prev.height;
            this.width = this.getParent().width() - this.padding * 2;
            return this.height = this.getHeightInVerticalMode();
        };

        VerticalCarouselItem.prototype.calculateCoordinatesAsCurrent = function() {
            var top;
            this.width = this.getParent().width() - this.padding * 2;
            this.height = this.getHeightInVerticalMode();
            top = this.getParent().height() / 2 - this.height / 2;
            this.left = this.padding;
            return this.top = top;
        };

        return VerticalCarouselItem;

    })(Uberbox.CarouselItem);

    Uberbox.HorizontalCarouselItem = (function(_super) {
        __extends(HorizontalCarouselItem, _super);

        function HorizontalCarouselItem() {
            return HorizontalCarouselItem.__super__.constructor.apply(this, arguments);
        }

        HorizontalCarouselItem.prototype.calculateCoordinatesAsPrev = function() {
            var next;
            next = this.getOption('next');
            this.height = this.getParent().height() - this.padding * 2;
            this.width = this.getWidthInHorizontalMode();
            this.left = next.left - this.width - this.padding;
            return this.top = this.padding;
        };

        HorizontalCarouselItem.prototype.calculateCoordinatesAsNext = function() {
            var prev;
            prev = this.getOption('prev');
            this.left = prev.left + prev.width + this.padding;
            this.top = this.padding;
            this.height = this.getParent().height() - this.padding * 2;
            return this.width = this.getWidthInHorizontalMode();
        };

        HorizontalCarouselItem.prototype.calculateCoordinatesAsCurrent = function() {
            this.height = this.getParent().height() - this.padding * 2;
            this.width = this.getWidthInHorizontalMode();
            this.left = this.getParent().width() / 2 - this.width / 2;
            return this.top = this.padding;
        };

        return HorizontalCarouselItem;

    })(Uberbox.CarouselItem);

    Uberbox.Carousel = (function(_super) {
        __extends(Carousel, _super);

        function Carousel() {
            this.layout = __bind(this.layout, this);
            return Carousel.__super__.constructor.apply(this, arguments);
        }

        Carousel.prototype.className = 'uberbox-carousel-content';

        Carousel.prototype.template = function() {
            return Uberbox.Templates['carousel-content'];
        };

        Carousel.prototype.render = function() {
            return this.$el.html(Marionette.Renderer.render(this.template));
        };

        Carousel.prototype.getChildViewClass = function() {
            if (this.getOption('orientation') === 'vertical') {
                return Uberbox.VerticalCarouselItem;
            } else {
                return Uberbox.HorizontalCarouselItem;
            }
        };

        Carousel.prototype.layout = function() {
            var item, _results;
            this.currentItemView.layoutAsCurrent();
            item = this.currentItemView.getOption('next');
            while (item) {
                item.layoutAsNext();
                item = item.getOption('next');
            }
            item = this.currentItemView.getOption('prev');
            _results = [];
            while (item) {
                item.layoutAsPrev();
                _results.push(item = item.getOption('prev'));
            }
            return _results;
        };

        Carousel.prototype.buildFromScratch = function(item) {
            this.currentItemView = this.createChildView(item);
            this.currentItemView.layoutAsCurrent();
            this.currentItemView.reveal();
            return this.currentItemView.runAction((function(_this) {
                return function() {
                    _this.layoutNextItems(_this.currentItemView);
                    return _this.layoutPrevItems(_this.currentItemView);
                };
            })(this));
        };

        Carousel.prototype.slideTo = function(item) {
            return this.currentItemView.runAction((function(_this) {
                return function() {
                    _this.currentItemView = item;
                    return _this.layout();
                };
            })(this));
        };

        Carousel.prototype.layout = function() {
            this.currentItemView.layoutAsCurrent();
            return this.currentItemView.runAction((function(_this) {
                return function() {
                    _this.layoutPrevItems(_this.currentItemView);
                    return _this.layoutNextItems(_this.currentItemView);
                };
            })(this));
        };

        Carousel.prototype.layoutNextItems = function(prev) {
            var view;
            if (prev !== this.currentItemView) {
                prev.layoutAsNext();
                if (!prev.fits()) {
                    prev.remove();
                    return null;
                }
            }
            if (prev.model.next() && !prev.getOption('next') && prev.belongs()) {
                view = this.createChildView(prev.model.next(), {
                    prev: prev
                });
                prev.options.next = view;
                view.options.prev = prev;
                view.layoutAsNext();
                view.reveal();
                return view.runAction((function(_this) {
                    return function() {
                        return _this.layoutNextItems(view);
                    };
                })(this));
            } else if (prev.getOption('next')) {
                return this.layoutNextItems(prev.getOption('next'));
            }
        };

        Carousel.prototype.layoutPrevItems = function(next) {
            var view;
            if (next !== this.currentItemView) {
                next.layoutAsPrev();
                if (!next.fits()) {
                    next.remove();
                    return null;
                }
            }
            if (next.model.prev() && !next.getOption('prev') && next.belongs()) {
                view = this.createChildView(next.model.prev(), {
                    next: next
                });
                next.options.prev = view;
                view.options.next = next;
                view.layoutAsPrev();
                view.reveal();
                return view.runAction((function(_this) {
                    return function() {
                        return _this.layoutPrevItems(view);
                    };
                })(this));
            } else if (next.getOption('prev')) {
                return this.layoutPrevItems(next.getOption('prev'));
            }
        };

        Carousel.prototype.onItemActivated = function(item) {
            var next, prev;
            if (this.currentItemView && item === this.currentItemView.model) {
                return;
            }
            if (!this.currentItemView) {
                this.buildFromScratch(item);
                return;
            }
            if (next = this.currentItemView.getNextToScrollTo(item)) {
                return this.slideTo(next);
            } else if (prev = this.currentItemView.getPrevToScrollTo(item)) {
                return this.slideTo(prev);
            } else {
                this.currentItemView.remove();
                next = this.currentItemView.getOption('next');
                while (next) {
                    next.remove();
                    next = next.getOption('next');
                }
                prev = this.currentItemView.getOption('prev');
                while (prev) {
                    prev.remove();
                    prev = prev.getOption('prev');
                }
                return this.buildFromScratch(item);
            }
        };

        return Carousel;

    })(Uberbox.SlidingWindow);

    var __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

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

        ToolbarView.prototype.className = 'uberbox-toolbar';

        ToolbarView.prototype.ui = {
            fullscreen: '*[data-action=fullscreen]',
            exitFullscreen: '*[data-action=exit-fullscreen]',
            close: '*[data-action=close]',
            share: '*[data-action=share]',
            shareMenu: '.uberbox-share-menu'
        };

        ToolbarView.prototype.events = {
            'click @ui.fullscreen': 'onFullscreenClick',
            'click @ui.exitFullscreen': 'onExitFullscreenClick',
            'click @ui.close': 'onCloseClick',
            'click @ui.share': 'onShareClick',
            'click .uberbox-share-overlay': 'onShareClick'
        };

        ToolbarView.prototype.initialize = function() {
            ToolbarView.__super__.initialize.apply(this, arguments);
            this.render();
            this.bindUIElements();
            return setTimeout(((function(_this) {
                return function() {
                    _this.layout();
                    _this.$el.addClass('uberbox-visible');
                    return setTimeout((function() {
                        return _this.layout();
                    }), 200);
                };
            })(this)), 500);
        };

        ToolbarView.prototype.serializeData = function() {
            return {
                model: this.model
            };
        };

        ToolbarView.prototype.layout = function() {
            var item, offset;
            item = this.getOption('bindTo');
            offset = item.currentItemView.getOffset();
            return this.$el.width(item.currentItemView.getWidth()).css({
                left: offset.left,
                top: offset.top - jQuery(window).scrollTop()
            });
        };

        ToolbarView.prototype.onFullscreenClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.ui.fullscreen.prop('disabled', true);
            this.ui.exitFullscreen.prop('disabled', false);
            return Uberbox.Utils.enterFullscreen(document.documentElement);
        };

        ToolbarView.prototype.onExitFullscreenClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.ui.exitFullscreen.prop('disabled', true);
            this.ui.fullscreen.prop('disabled', false);
            return Uberbox.Utils.exitFullscreen();
        };

        ToolbarView.prototype.onCloseClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return this.trigger('close');
        };

        ToolbarView.prototype.onShareClick = function(e) {
            if (!this.ui.share.hasClass('uberbox-active')) {
                this.ui.share.append(jQuery('<div class="uberbox-share-overlay">'));
                this.ui.share.addClass('uberbox-active');
                return _.defer((function(_this) {
                    return function() {
                        _this.ui.share.find('.uberbox-share-overlay').addClass('uberbox-active');
                        return _this.ui.shareMenu.addClass('uberbox-active');
                    };
                })(this));
            } else {
                this.ui.share.find('.uberbox-share-overlay').removeClass('uberbox-active');
                this.ui.shareMenu.removeClass('uberbox-active');
                return setTimeout(((function(_this) {
                    return function() {
                        _this.ui.share.find('.uberbox-share-overlay').remove();
                        return _this.ui.share.removeClass('uberbox-active');
                    };
                })(this)), 300);
            }
        };

        ToolbarView.prototype.remove = function() {
            this.stopListening();
            this.$el.html('');
            return this;
        };

        return ToolbarView;

    })(Marionette.ItemView);

    var ObjectView,
        __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    ObjectView = (function(_super) {
        __extends(ObjectView, _super);

        function ObjectView() {
            this.onObjectLoaded = __bind(this.onObjectLoaded, this);
            this.fadeIn = __bind(this.fadeIn, this);
            return ObjectView.__super__.constructor.apply(this, arguments);
        }

        ObjectView.prototype.supportsOversizing = false;

        ObjectView.prototype.fadeIn = function() {
            this.visible = true;
            return this.$el.addClass('uberbox-visible');
        };

        ObjectView.prototype.getAspectRatio = function() {
            return this.$el.width() / this.$el.height();
        };

        ObjectView.prototype.isObjectLoaded = function() {};

        ObjectView.prototype.getObjectNaturalAspectRatio = function() {};

        ObjectView.prototype.layoutOversized = function() {};

        ObjectView.prototype.getTemplate = function() {
            return this.getOption('template')();
        };

        ObjectView.prototype.getWidth = function() {
            return this.$el.width();
        };

        ObjectView.prototype.getObjectNaturalAspectRatio = function() {
            return this.getObjectNaturalWidth() / this.getObjectNaturalHeight();
        };

        ObjectView.prototype.onObjectError = function() {
            return this.trigger('error');
        };

        ObjectView.prototype.onObjectLoaded = function() {
            return this.trigger('load');
        };

        ObjectView.prototype.serializeData = function() {
            return {
                model: this.model
            };
        };

        return ObjectView;

    })(Marionette.ItemView);

    Uberbox.ImageObjectView = (function(_super) {
        __extends(ImageObjectView, _super);

        function ImageObjectView() {
            return ImageObjectView.__super__.constructor.apply(this, arguments);
        }

        ImageObjectView.prototype.className = 'uberbox-image-content';

        ImageObjectView.prototype.waitForLoad = true;

        ImageObjectView.prototype.supportsOversizing = true;

        ImageObjectView.prototype.template = function() {
            return Uberbox.Templates['content-image'];
        };

        ImageObjectView.prototype.ui = {
            image: 'img'
        };

        ImageObjectView.prototype.bindUIElements = function() {
            ImageObjectView.__super__.bindUIElements.apply(this, arguments);
            if (this.isObjectLoaded()) {
                this.onObjectLoaded();
            }
            this.ui.image.one('load.uberbox', this.onObjectLoaded);
            return this.ui.image.one('error.uberbox', this.onObjectError);
        };

        ImageObjectView.prototype.unbindUIElements = function() {
            this.ui.image.off('load.uberbox');
            this.ui.image.off('error.uberbox');
            return ImageObjectView.__super__.unbindUIElements.apply(this, arguments);
        };

        ImageObjectView.prototype.getObjectWidth = function() {
            return this.ui.image.width();
        };

        ImageObjectView.prototype.isObjectLoaded = function() {
            return this.ui.image[0].complete;
        };

        ImageObjectView.prototype.getObjectNaturalWidth = function() {
            return this.ui.image[0].naturalWidth;
        };

        ImageObjectView.prototype.getObjectNaturalHeight = function() {
            return this.ui.image[0].naturalHeight;
        };

        return ImageObjectView;

    })(ObjectView);

    Uberbox.IframeObjectView = (function(_super) {
        __extends(IframeObjectView, _super);

        function IframeObjectView() {
            this.onWindowResized = __bind(this.onWindowResized, this);
            return IframeObjectView.__super__.constructor.apply(this, arguments);
        }

        IframeObjectView.prototype.waitForLoad = true;

        IframeObjectView.prototype.supportsOversizing = false;

        IframeObjectView.prototype.ui = {
            iframe: 'iframe'
        };

        IframeObjectView.prototype.template = function() {
            return Uberbox.Templates['content-iframe'];
        };

        IframeObjectView.prototype.bindUIElements = function() {
            IframeObjectView.__super__.bindUIElements.apply(this, arguments);
            this.ui.iframe.one('load.uberbox', this.onObjectLoaded);
            if (this.isObjectLoaded()) {
                this.onObjectLoaded();
            }
            jQuery(window).on('resize.uberbox', this.onWindowResized);
            return _.defer((function(_this) {
                return function() {
                    return _this.onWindowResized();
                };
            })(this));
        };

        IframeObjectView.prototype.unbindUIElements = function() {
            this.ui.iframe.off('load.uberbox');
            return jQuery(window).off('resize.uberbox');
        };

        IframeObjectView.prototype.getObjectWidth = function() {
            return this.ui.iframe.width();
        };

        IframeObjectView.prototype.isObjectLoaded = function() {
            return this.ui.iframe[0].complete;
        };

        IframeObjectView.prototype.serializeData = function() {
            return _.extend(IframeObjectView.__super__.serializeData.apply(this, arguments), {
                url: this.getIframeUrl()
            });
        };

        IframeObjectView.prototype.onWindowResized = function() {
            return this.ui.iframe.height(this.ui.iframe.width() / this.getObjectNaturalAspectRatio());
        };

        IframeObjectView.prototype.getIframeUrl = function() {
            return this.model.get('url');
        };

        IframeObjectView.prototype.getObjectNaturalWidth = function() {
            return this.$el.parent().width();
        };

        IframeObjectView.prototype.getObjectNaturalHeight = function() {
            return this.$el.parent().height();
        };

        return IframeObjectView;

    })(ObjectView);

    Uberbox.YoutubeObjectView = (function(_super) {
        __extends(YoutubeObjectView, _super);

        function YoutubeObjectView() {
            return YoutubeObjectView.__super__.constructor.apply(this, arguments);
        }

        YoutubeObjectView.prototype.className = 'uberbox-iframe-content uberbox-youtube-content';

        YoutubeObjectView.prototype.getIframeUrl = function() {
            return "//www.youtube.com/embed/" + (this.getVideoID());
        };

        YoutubeObjectView.prototype.getVideoID = function() {
            var regex, url;
            url = this.model.get('url');
            if (url.match(regex = /.*(\(\/\/)?(www\.)?youtube\.com\/watch\?v=/i)) {
                return url.replace(regex, '');
            } else {
                return url.replace(/.*(\/\/)(www\.)?youtu\.be\/.*/i, '');
            }
        };

        YoutubeObjectView.prototype.getObjectNaturalAspectRatio = function() {
            return 16.0 / 9.0;
        };

        return YoutubeObjectView;

    })(Uberbox.IframeObjectView);

    Uberbox.VimeoObjectView = (function(_super) {
        __extends(VimeoObjectView, _super);

        function VimeoObjectView() {
            return VimeoObjectView.__super__.constructor.apply(this, arguments);
        }

        VimeoObjectView.prototype.className = 'uberbox-iframe-content uberbox-vimeo-content';

        VimeoObjectView.prototype.getIframeUrl = function() {
            return "//player.vimeo.com/video/" + (this.getVideoID());
        };

        VimeoObjectView.prototype.getVideoID = function() {
            return this.model.get('url').replace(/(https?:)?(\/\/)?vimeo\.com\//i, '');
        };

        VimeoObjectView.prototype.getObjectNaturalAspectRatio = function() {
            return 16.0 / 9.0;
        };

        return VimeoObjectView;

    })(Uberbox.IframeObjectView);

    Uberbox.GoogleMapsObjectView = (function(_super) {
        __extends(GoogleMapsObjectView, _super);

        function GoogleMapsObjectView() {
            return GoogleMapsObjectView.__super__.constructor.apply(this, arguments);
        }

        GoogleMapsObjectView.prototype.className = 'uberbox-iframe-content uberbox-gmap-content';

        GoogleMapsObjectView.prototype.getIframeUrl = function() {
            return "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d17445.16630767115!2d60.755398270861825!3d56.86916950021604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sru!4v1429115765389";
        };

        GoogleMapsObjectView.prototype.getObjectNaturalAspectRatio = function() {
            return this.$el.parent().width() / this.$el.parent().height();
        };

        return GoogleMapsObjectView;

    })(Uberbox.IframeObjectView);

    Uberbox.SoundcloudObjectView = (function(_super) {
        __extends(SoundcloudObjectView, _super);

        function SoundcloudObjectView() {
            return SoundcloudObjectView.__super__.constructor.apply(this, arguments);
        }

        SoundcloudObjectView.prototype.className = 'uberbox-iframe-content uberbox-soundcloud-content';

        SoundcloudObjectView.prototype.getIframeUrl = function() {
            return "//w.soundcloud.com/player/?url=" + encodeURIComponent(this.model.get('url'));
        };

        return SoundcloudObjectView;

    })(Uberbox.IframeObjectView);

    Uberbox.BandcampObjectView = (function(_super) {
        __extends(BandcampObjectView, _super);

        function BandcampObjectView() {
            return BandcampObjectView.__super__.constructor.apply(this, arguments);
        }

        BandcampObjectView.prototype.className = 'uberbox-iframe-content uberbox-bandcamp-content';

        BandcampObjectView.prototype.getIframeUrl = function() {
            return this.model.get('url');
        };

        return BandcampObjectView;

    })(Uberbox.IframeObjectView);

    Uberbox.HTMLObjectView = (function(_super) {
        __extends(HTMLObjectView, _super);

        function HTMLObjectView() {
            return HTMLObjectView.__super__.constructor.apply(this, arguments);
        }

        HTMLObjectView.prototype.className = 'uberbox-html-content';

        HTMLObjectView.prototype.waitForLoad = false;

        HTMLObjectView.prototype.template = function() {
            return Uberbox.Templates['html-content'];
        };

        HTMLObjectView.prototype.getObjectNaturalWidth = function() {
            return 650;
        };

        HTMLObjectView.prototype.getObjectNaturalHeight = function() {
            return 400;
        };

        return HTMLObjectView;

    })(ObjectView);

    var __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    Uberbox.LightboxItem = (function(_super) {
        __extends(LightboxItem, _super);

        function LightboxItem() {
            this.layout = __bind(this.layout, this);
            return LightboxItem.__super__.constructor.apply(this, arguments);
        }

        LightboxItem.prototype.defaults = {
            description: {
                position: 'right'
            }
        };

        LightboxItem.prototype.template = function() {
            return Uberbox.Templates['lightbox-item'];
        };

        LightboxItem.prototype.className = 'uberbox-lightbox-item';

        LightboxItem.prototype.regions = {
            object: '.uberbox-item-object',
            description: '.uberbox-item-description'
        };

        LightboxItem.prototype.ui = {
            content: '> .uberbox-lightbox-item-content',
            description: '.uberbox-item-description'
        };

        LightboxItem.prototype.padding = 20;

        LightboxItem.prototype.initialize = function() {
            LightboxItem.__super__.initialize.apply(this, arguments);
            return this.once('load', (function(_this) {
                return function() {
                    return _this.showContent();
                };
            })(this));
        };

        LightboxItem.prototype.showContent = function() {
            return _.defer((function(_this) {
                return function() {
                    _this.layout();
                    return _.defer(function() {
                        return _this.$el.addClass('uberbox-visible');
                    });
                };
            })(this));
        };

        LightboxItem.prototype.serializeData = function() {
            return {
                model: this.model
            };
        };

        LightboxItem.prototype.layout = function() {
            var height, width;
            if (this.waitForLoad && !this.loaded) {
                return;
            }
            width = this.$el.width();
            height = this.$el.height();
            if (width === 0 || height === 0) {
                return;
            }
            if (this.model.get('description_style') === 'right') {
                return this.layoutWithDescriptionAtRight();
            } else if (this.model.get('description_style') === 'mini') {
                return this.layoutWithMiniDescription();
            } else if (this.model.get('description_style') === 'bottom') {
                return this.layoutWithDescriptionAtBottom();
            }
        };

        LightboxItem.prototype.getOffset = function() {
            var left, offset;
            offset = jQuery(this.$el).offset();
            if (this.model.get('description_style') === 'bottom' || this.model.get('description_style') === 'mini') {
                left = this.object.currentView.$el.offset().left;
                return {
                    left: left,
                    top: this.object.currentView.$el.offset().top
                };
            }
            return this.object.currentView.$el.offset();
        };

        LightboxItem.prototype.getWidth = function() {
            if (this.model.get('description_style') === 'bottom' || this.model.get('description_style') === 'mini') {
                return this.object.currentView.$el.width();
            }
            return this.object.currentView.$el.width() + this.ui.description.outerWidth();
        };

        LightboxItem.prototype.layoutWithDescriptionAtBottom = function() {
            var availableAreaAspectRatio, height, objectAspectRatio, width;
            if (!this.object.currentView.supportsOversizing) {
                this.$el.addClass('uberbox-fit-height');
                return;
            }
            width = this.object.$el.width();
            height = this.object.$el.height();
            objectAspectRatio = this.object.currentView.getObjectNaturalAspectRatio();
            availableAreaAspectRatio = width / height;
            this.fitOversized();
            if (this.$el.height() < this.$el.parent().height()) {
                return this.$el.addClass('uberbox-center-vertically');
            } else {
                return this.$el.removeClass('uberbox-center-vertically');
            }
        };

        LightboxItem.prototype.layoutWithMiniDescription = function() {
            var availableRatio, height, item, objectRatio, objectView, width;
            width = this.object.$el.width();
            height = this.object.$el.height();
            item = this.$el.closest('.uberbox-lightbox-item');
            objectView = this.object.currentView;
            this.$el.css('margin-left', '');
            if (objectView.getObjectNaturalWidth() < width && objectView.getObjectNaturalHeight() < height) {
                return this.fitNaturally();
            } else {
                availableRatio = item.width() / (item.height() - (this.description.currentView ? this.description.$el.outerHeight() : 0));
                objectRatio = objectView.getObjectNaturalAspectRatio();
                if (availableRatio > objectRatio) {
                    return this.fitHeight();
                } else {
                    return this.fitWidth();
                }
            }
        };

        LightboxItem.prototype.layoutWithDescriptionAtRight = function() {
            var availableAreaAspectRatio, availableAreaWidth, height, objectAspectRatio, width;
            if (!this.object.currentView.supportsOversizing) {
                this.$el.addClass('uberbox-skin-dark');
                return;
            }
            width = this.$el.width();
            height = this.$el.height();
            objectAspectRatio = this.object.currentView.getObjectNaturalAspectRatio();
            availableAreaWidth = width - this.ui.description.width();
            availableAreaAspectRatio = availableAreaWidth / height;
            return this.fitOversized();
        };

        LightboxItem.prototype.fitHeight = function() {
            return this.$el.addClass('uberbox-fit-height').removeClass('uberbox-fit-width uberbox-natural-fit uberbox-fit-oversized uberbox-fit-height-oversized uberbox-fit-width-oversized');
        };

        LightboxItem.prototype.fitWidth = function() {
            return this.$el.addClass('uberbox-fit-width').removeClass('uberbox-fit-height uberbox-natural-fit uberbox-fit-oversized uberbox-fit-height-oversized uberbox-fit-width-oversized');
        };

        LightboxItem.prototype.fitNaturally = function() {
            return this.$el.removeClass('uberbox-fit-width uberbox-fit-height uberbox-natural-fit uberbox-fit-height-oversized uberbox-fit-width-oversized uberbox-fit-oversized').addClass('uberbox-natural-fit');
        };

        LightboxItem.prototype.fitOversized = function() {
            this.$el.addClass('uberbox-fit-oversized').removeClass('uberbox-fit-width uberbox-fit-height');
            if (this.object.currentView.getObjectNaturalAspectRatio() > this.object.currentView.getAspectRatio()) {
                return this.$el.addClass('uberbox-fit-height-oversized').removeClass('uberbox-fit-width-oversized');
            } else {
                return this.$el.addClass('uberbox-fit-width-oversized').removeClass('uberbox-fit-height-oversized');
            }
        };

        LightboxItem.prototype.hideLoader = function() {};

        LightboxItem.prototype.showLoader = function() {};

        LightboxItem.prototype.showRegions = function() {
            var type;
            type = Uberbox.getObjectViewType(this.model);
            if (this.model.get('description')) {
                this.$el.addClass('uberbox-has-description');
                this.$el.addClass("uberbox-description-" + (this.model.get('description_style')));
            }
            this.object.show(new type(_.extend(this.options, {
                model: this.model
            })));
            if (this.object.currentView.waitForLoad) {
                this.showLoader();
                return this.listenToOnce(this.object.currentView, 'load', (function(_this) {
                    return function() {
                        _this.trigger('load');
                        return _this.hideLoader();
                    };
                })(this));
            } else {
                this.trigger('load');
                return this.showContent();
            }
        };

        LightboxItem.prototype.layoutAsCurrent = function() {
            this.$el.css({
                transform: ''
            });
            return this.layout();
        };

        LightboxItem.prototype.remove = function() {
            if (this.model.isNext()) {
                this.$el.addClass('uberbox-flyout-next');
            }
            if (this.model.isPrev()) {
                this.$el.addClass('uberbox-flyout-prev');
            }
            if (this.getOption('next')) {
                this.getOption('next').options.prev = null;
            }
            if (this.getOption('prev')) {
                this.getOption('prev').options.next = null;
            }
            return setTimeout(((function(_this) {
                return function() {
                    return LightboxItem.__super__.remove.call(_this);
                };
            })(this)), 600);
        };

        return LightboxItem;

    })(Uberbox.SlidingWindowItem);

    Uberbox.DownloadView = (function(_super) {
        __extends(DownloadView, _super);

        function DownloadView() {
            return DownloadView.__super__.constructor.apply(this, arguments);
        }

        DownloadView.prototype.template = '#uberbox-template-download';

        return DownloadView;

    })(Marionette.ItemView);

    Uberbox.VerticalLightboxItem = (function(_super) {
        __extends(VerticalLightboxItem, _super);

        function VerticalLightboxItem() {
            return VerticalLightboxItem.__super__.constructor.apply(this, arguments);
        }

        VerticalLightboxItem.prototype.layoutAsNext = function() {
            this.$el.css({
                transform: "translate(0, " + (jQuery(window).height()) + "px)"
            });
            return this.layout();
        };

        VerticalLightboxItem.prototype.layoutAsPrev = function() {
            this.$el.css({
                transform: "translate(0, -" + (jQuery(window).height()) + "px)"
            });
            return this.layout();
        };

        return VerticalLightboxItem;

    })(Uberbox.LightboxItem);

    Uberbox.HorizontalLightboxItem = (function(_super) {
        __extends(HorizontalLightboxItem, _super);

        function HorizontalLightboxItem() {
            return HorizontalLightboxItem.__super__.constructor.apply(this, arguments);
        }

        HorizontalLightboxItem.prototype.layoutAsNext = function() {
            this.$el.css({
                transform: 'translate(120%, 0)'
            });
            return this.layout();
        };

        HorizontalLightboxItem.prototype.layoutAsPrev = function() {
            this.$el.css({
                transform: 'translate(-120%, 0)'
            });
            return this.layout();
        };

        return HorizontalLightboxItem;

    })(Uberbox.LightboxItem);

    Uberbox.Lightbox = (function(_super) {
        __extends(Lightbox, _super);

        function Lightbox() {
            this.layout = __bind(this.layout, this);
            return Lightbox.__super__.constructor.apply(this, arguments);
        }

        Lightbox.prototype.className = 'uberbox-lightbox-content';

        Lightbox.prototype.template = function() {
            return Uberbox.Templates['lightbox-content'];
        };

        Lightbox.prototype.ui = {
            next: '.uberbox-next',
            prev: '.uberbox-prev'
        };

        Lightbox.prototype.events = {
            'click @ui.next': (function() {
                if (!this.ui.next.is('.uberbox-disabled')) {
                    return this.currentItemView.model.next().activate();
                }
            }),
            'click @ui.prev': (function() {
                if (!this.ui.prev.is('.uberbox-disabled')) {
                    return this.currentItemView.model.prev().activate();
                }
            }),
            'click @ui.close': function() {
                return this.trigger('close');
            }
        };

        Lightbox.prototype.getChildViewClass = function() {
            if (this.getOption('orientation') === 'horizontal') {
                return Uberbox.HorizontalLightboxItem;
            } else {
                return Uberbox.VerticalLightboxItem;
            }
        };

        Lightbox.prototype.onShow = function() {
            Lightbox.__super__.onShow.apply(this, arguments);
            this.render();
            return this.bindUIElements();
        };

        Lightbox.prototype.render = function() {
            return this.$el.html(Marionette.Renderer.render(this.template));
        };

        Lightbox.prototype.onItemActivated = function(item) {
            if (!this.currentItemView) {
                this.rebuild();
            } else {
                if (item === this.currentItemView.model.next()) {
                    this.scrollNext();
                } else if (item === this.currentItemView.model.prev()) {
                    this.scrollPrev();
                } else {
                    this.rebuild();
                }
            }
            if (this.currentItemView.model.next()) {
                this.ui.next.removeClass('uberbox-disabled');
            } else {
                this.ui.next.addClass('uberbox-disabled');
            }
            if (this.currentItemView.model.prev()) {
                return this.ui.prev.removeClass('uberbox-disabled');
            } else {
                return this.ui.prev.addClass('uberbox-disabled');
            }
        };

        Lightbox.prototype.checkPrevNext = function() {};

        Lightbox.prototype.rebuild = function() {
            var next, prev;
            if (this.currentItemView) {
                this.currentItemView.remove();
            }
            if (this.prevItemView) {
                this.prevItemView.remove();
            }
            if (this.nextItemView) {
                this.nextItemView.remove();
            }
            this.currentItemView = this.createChildView(this.collection.activeItem);
            if (next = this.collection.activeItem.next()) {
                this.nextItemView = this.createChildView(next, {
                    prev: this.currentItemView
                });
            }
            if (prev = this.collection.activeItem.prev()) {
                return this.prevItemView = this.createChildView(prev, {
                    next: this.currentItemView
                });
            }
        };

        Lightbox.prototype.scrollNext = function() {
            if (this.prevItemView) {
                this.prevItemView.remove();
            }
            this.currentItemView.layoutAsPrev();
            this.prevItemView = this.currentItemView;
            this.nextItemView.layoutAsCurrent();
            this.currentItemView = this.nextItemView;
            if (this.nextItemView.model.next()) {
                return this.nextItemView = this.createChildView(this.nextItemView.model.next(), {
                    prev: this.nextItemView
                });
            } else {
                return this.nextItemView = null;
            }
        };

        Lightbox.prototype.scrollPrev = function() {
            if (this.nextItemView) {
                this.nextItemView.remove();
            }
            this.currentItemView.layoutAsNext();
            this.nextItemView = this.currentItemView;
            this.prevItemView.layoutAsCurrent();
            this.currentItemView = this.prevItemView;
            if (this.prevItemView.model.prev()) {
                return this.prevItemView = this.createChildView(this.prevItemView.model.prev(), {
                    next: this.prevItemView
                });
            } else {
                return this.prevItemView = null;
            }
        };

        Lightbox.prototype.layout = function() {
            this.currentItemView.layoutAsCurrent();
            if (this.nextItemView) {
                _.debounce(((function(_this) {
                    return function() {
                        return _this.nextItemView.layoutAsNext();
                    };
                })(this)), 200);
            }
            if (this.prevItemView) {
                return _.debounce(((function(_this) {
                    return function() {
                        return _this.prevItemView.layoutAsPrev();
                    };
                })(this)), 200);
            }
        };

        return Lightbox;

    })(Uberbox.SlidingWindow);

    if (root.Uberbox) {
        Uberbox.Templates = root.Uberbox.Templates;
    }
    return Uberbox;
}));
