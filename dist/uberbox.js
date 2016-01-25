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
        bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty;

    Uberbox = (function(superClass) {
        extend(Uberbox, superClass);

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

        Uberbox.prototype.onTouchCancel = function(e) {
            return e.preventDefault();
        };

        Uberbox.prototype.isAndroid = function() {
            return navigator.userAgent.toLowerCase().indexOf('android') !== -1;
        };

        Uberbox.prototype.onTouchStart = function(e) {
            if (jQuery(e.target).closest('.uberbox-toolbar-wrapper, .uberbox-prev, .uberbox-next').length > 0) {
                return;
            }
            e.preventDefault();
            return this.touchStartedAt = {
                pageX: e.touches[0].pageX,
                pageY: e.touches[0].pageY
            };
        };

        Uberbox.prototype.onTouchMove = function(e) {
            var diffX, diffY, original, threshold;
            if (!this.touchStartedAt) {
                return;
            }
            e.preventDefault();
            threshold = 5;
            original = e.touches[0];
            diffX = original.pageX - this.touchStartedAt.pageX;
            diffY = original.pageY - this.touchStartedAt.pageX;
            if (this.getOption('orientation') === 'horizontal' && Math.abs(diffX) > threshold) {
                this.lightbox.currentView.currentItemView.swipeHorizontally(diffX > 0 ? diffX - threshold : diffX + threshold);
                return e.preventDefault();
            } else if (this.getOption('orientation') === 'vertical' && Math.abs(diffY) > threshold) {
                this.lightbox.currentView.currentItemView.swipeVertically(diffY > 0 ? diffY - threshold : diffY + threshold);
                return e.preventDefault();
            } else {
                this.lightbox.currentView.currentItemView.swipeBack();
                if (this.collection.activeItem.get('description_style') === 'mini' || this.collection.activeItem.get('description_style') === 'none') {
                    return e.preventDefault();
                } else {
                    return e.stopPropagation();
                }
            }
        };

        Uberbox.prototype.shouldBotherWithTouch = function(e) {
            return this.getOption('orientation') === 'horizontal' && Math.abs() > threshold || this.getOption('orientation') === 'vertical' && Math.abs(e.pageY - this.touchStartedAt.top) > threshold;
        };

        Uberbox.prototype.onTouchEnd = function(e) {
            var diffX, diffY, original, threshold;
            original = e;
            threshold = 15;
            original = e.changedTouches[0];
            diffX = original.pageX - this.touchStartedAt.pageX;
            diffY = original.pageY - this.touchStartedAt.pageY;
            if (this.getOption('orientation') === 'horizontal') {
                if (diffX > threshold && this.lightbox.currentView.currentItemView.model.prev()) {
                    this.lightbox.currentView.currentItemView.swipeBack();
                    this.lightbox.currentView.currentItemView.model.prev().activate();
                }
                if (diffX < -threshold && this.lightbox.currentView.currentItemView.model.next()) {
                    this.lightbox.currentView.currentItemView.swipeBack();
                    this.lightbox.currentView.currentItemView.model.next().activate();
                }
            }
            if (this.getOption('orientation') === 'vertical') {
                if (diffY > threshold && this.lightbox.currentView.currentItemView.model.prev()) {
                    this.lightbox.currentView.currentItemView.swipeBack();
                    this.lightbox.currentView.currentItemView.model.prev().activate();
                }
                if (diffY < -threshold && this.lightbox.currentView.currentItemView.model.next()) {
                    this.lightbox.currentView.currentItemView.swipeBack();
                    this.lightbox.currentView.currentItemView.model.next().activate();
                }
            }
            this.lightbox.currentView.currentItemView.swipeBack();
            return this.touchStartedAt = null;
        };

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
                ajax: {
                    condition: function(item) {
                        return item.get('ajax');
                    },
                    "class": Uberbox.AJAXOBjectView
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
                if (Uberbox.Utils.isFullscreen()) {
                    Uberbox.Utils.exitFullscreen();
                }
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
            var condition, config, ref, type, url;
            if (type = item.get('type')) {
                return Uberbox.contentViewTypes()[type]['class'];
            }
            ref = Uberbox.contentViewTypes();
            for (type in ref) {
                config = ref[type];
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
            return Uberbox.contentViewTypes().unknown;
        };

        function Uberbox(options) {
            this.onKeyDown = bind(this.onKeyDown, this);
            this.onItemActivated = bind(this.onItemActivated, this);
            this.onTouchEnd = bind(this.onTouchEnd, this);
            this.onTouchMove = bind(this.onTouchMove, this);
            this.onTouchStart = bind(this.onTouchStart, this);
            Uberbox.__super__.constructor.call(this, _.extend({
                el: jQuery('<div class="uberbox" />').appendTo(jQuery('body'))
            }, options));
        }

        Uberbox.prototype.initialize = function() {
            var $html, current, lightboxOptions;
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
                if (jQuery(window).width() > 1024) {
                    this.$el.addClass('uberbox-has-carousel');
                    this.carousel.show(new Uberbox.Carousel(lightboxOptions));
                }
                jQuery(window).on('resize.uberbox-main', (function(_this) {
                    return function() {
                        if (jQuery(window).width() < 1024) {
                            _this.carousel.empty();
                            return _this.$el.removeClass('uberbox-has-carousel');
                        } else if (!_this.carousel.currentView) {
                            _this.$el.addClass('uberbox-has-carousel');
                            return _this.carousel.show(new Uberbox.Carousel(lightboxOptions));
                        }
                    };
                })(this));
            } else {
                this.$('.uberbox-carousel-wrapper').remove();
            }
            this.listenTo(this.getOption('collection'), 'close', (function(_this) {
                return function() {
                    return Uberbox.close();
                };
            })(this));
            this.listenTo(this.getOption('collection'), 'activate', this.onItemActivated);
            current = this.getOption('collection').at(this.getOption('current'));
            current.activate();
            jQuery('body').on('keydown', this.onKeyDown);
            $html = jQuery('html');
            this.overflow = $html.css('overflow');
            $html.css('overflow', 'hidden');
            this.el.addEventListener('touchstart', this.onTouchStart);
            this.el.addEventListener('touchend', this.onTouchEnd);
            return this.el.addEventListener('touchmove', this.onTouchMove);
        };

        Uberbox.prototype.onItemActivated = function(item) {
            if (this.toolbar.currentView) {
                this.stopListening(this.toolbar.currentView, 'close');
            }
            this.toolbar.show(new Uberbox.ToolbarView({
                model: item
            }));
            this.listenTo(this.toolbar.currentView, 'close', (function(_this) {
                return function() {
                    return _this.close();
                };
            })(this));
            if (!item.get('loaded')) {
                this.showLoader();
            }
            if (this.oldActiveItem) {
                this.stopListening(this.oldActiveItem, 'load');
            }
            this.oldActiveItem = item;
            return this.listenTo(item, 'load', (function(_this) {
                return function() {
                    return _this.hideLoader();
                };
            })(this));
        };

        Uberbox.prototype.hideLoader = function() {
            if (this.showLoaderTimeout) {
                clearTimeout(this.showLoaderTimeout);
                this.showLoaderTimeout = null;
            }
            return this.$el.find('div.uberbox-loader').remove();
        };

        Uberbox.prototype.showLoader = function() {
            if (this.showLoaderTimeout) {
                return;
            }
            return this.showLoaderTimeout = setTimeout(((function(_this) {
                return function() {
                    return _this.$el.append(jQuery('<div class="uberbox-loader uberbox-icon-arrows-ccw">'));
                };
            })(this)), 100);
        };

        Uberbox.prototype.remove = function() {
            this.trigger('close');
            Uberbox.__super__.remove.apply(this, arguments);
            if (Uberbox.Utils.isFullscreen()) {
                Uberbox.Utils.exitFullscreen();
            }
            this.ui.overlay.removeClass('visible');
            jQuery('body').off('keydown.uberbox', this.onKeyDown);
            jQuery('html').css('overflow', this.overflow);
            this.el.removeEventListener('touchstart', this.onTouchStart);
            this.el.removeEventListener('touchend', this.onTouchEnd);
            this.el.removeEventListener('touchmove', this.onTouchMove);
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
            var el, i, len, prefix, ref;
            el = document.documentElement;
            if (el.requestFullscreen) {
                return true;
            }
            ref = ['moz', 'webkit', 'ms'];
            for (i = 0, len = ref.length; i < len; i++) {
                prefix = ref[i];
                if (el[prefix + "RequestFullScreen"]) {
                    return true;
                }
            }
            return false;
        };

        Utils.isFullscreen = function() {
            var i, len, method, ref;
            ref = ['fullscreenEnabled', 'webkitFullscreenEnabled', 'mozFullscreenEnabled', 'msFullscreenEnabled'];
            for (i = 0, len = ref.length; i < len; i++) {
                method = ref[i];
                if (!_.isUndefined(document[method])) {
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

        Utils.notification = function(options) {
            var notification;
            notification = jQuery('<div class="uberbox-notification" />').html(options.message).appendTo(jQuery('body'));
            _.defer((function(_this) {
                return function() {
                    return notification.addClass('uberbox-active');
                };
            })(this));
            return setTimeout(((function(_this) {
                return function() {
                    notification.removeClass('uberbox-active');
                    return setTimeout((function() {
                        return notification.remove();
                    }), 600);
                };
            })(this)), 4000);
        };

        return Utils;

    })();

    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty;

    Uberbox.ShareService = (function(superClass) {
        extend(ShareService, superClass);

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
                url: "//delicious.com/post?url=%url%",
                name: 'Delicious'
            },
            pinterest: {
                url: "https://www.pinterest.com/pin/create/button/?url=%url%&media=%image_url%&description=%description%&title=%title%",
                name: 'Pinterest'
            },
            vk: {
                url: "http://vk.com/share.php?url=%url%",
                name: 'VK'
            }
        };

        ShareService.prototype.processPseudotags = function(template, model) {
            var tag, tags;
            tags = {
                url: window.location.href,
                image_url: model.get('url'),
                title: model.get('title') || '',
                description: model.get('description') || ''
            };
            for (tag in tags) {
                template = template.replace("%" + tag + "%", encodeURIComponent(tags[tag]));
            }
            return template;
        };

        ShareService.prototype.getShareLinkUrl = function(model) {
            return this.processPseudotags(this.get('url'), model);
        };

        return ShareService;

    })(Backbone.Model);

    Uberbox.Item = (function(superClass) {
        extend(Item, superClass);

        function Item() {
            return Item.__super__.constructor.apply(this, arguments);
        }

        Item.prototype.defaults = {
            description_style: 'mini',
            download_tooltip: 'Download',
            download_started_tooltip: 'Download started',
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
                this.set('share', _.map(share, function(config, name) {
                    return new Uberbox.ShareService(_.extend({}, {
                        slug: name
                    }, config));
                }));
            }
            if (!this.get('title') && !this.get('description')) {
                return this.set('description_style', 'none');
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

        Item.prototype.showDescription = function() {
            if (this.get('description_style') === 'none') {
                return false;
            }
            return !!this.get('description');
        };

        Item.prototype.follows = function(item) {
            var next;
            next = item.next();
            if (next === this) {
                return true;
            }
            if (next) {
                return this.follows(next);
            }
            return false;
        };

        Item.prototype.precedes = function(item) {
            var prev;
            prev = item.prev();
            if (prev === this) {
                return true;
            }
            if (prev) {
                return this.precedes(prev);
            }
            return false;
        };

        return Item;

    })(Backbone.Model);

    Uberbox.ItemCollection = (function(superClass) {
        extend(ItemCollection, superClass);

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
            if (this.activeItem && this.activeItem.next()) {
                return this.activeItem.next().activate();
            }
        };

        ItemCollection.prototype.activatePrev = function() {
            if (this.activeItem && this.activeItem.prev()) {
                return this.activeItem.prev().activate();
            }
        };

        return ItemCollection;

    })(Backbone.Collection);

    var bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty;

    Uberbox.SlidingWindowItem = (function(superClass) {
        extend(SlidingWindowItem, superClass);

        function SlidingWindowItem() {
            this.onClicked = bind(this.onClicked, this);
            this.enableTransition = bind(this.enableTransition, this);
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
                    _this.model.trigger('load');
                    _this.layout();
                    return _.defer(function() {
                        _this.enableTransition();
                        return _this.$el.addClass('uberbox-loaded');
                    });
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

        SlidingWindowItem.prototype.enableTransition = function() {
            return this.$el.addClass('uberbox-enable-transition');
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
                return this.listenToOnce(this, 'load', (function(_this) {
                    return function() {
                        return callback();
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

        SlidingWindowItem.prototype.isNext = function() {
            return this.model.follows(this.model.collection.activeItem);
        };

        SlidingWindowItem.prototype.isPrev = function() {
            return this.model.precedes(this.model.collection.activeItem);
        };

        SlidingWindowItem.prototype.isCurrent = function() {
            return this.model.isActive();
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

        SlidingWindowItem.prototype.reveal = function() {};

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

    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty;

    Uberbox.SlidingWindow = (function(superClass) {
        extend(SlidingWindow, superClass);

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
            return jQuery(window).on('resize', this.layout);
        };

        SlidingWindow.prototype.remove = function() {
            jQuery(window).off('resize', this.layout);
            return SlidingWindow.__super__.remove.apply(this, arguments);
        };

        SlidingWindow.prototype.getChildView = function(child) {
            var childView;
            return childView = this.getOption('childView');
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
            if (options.prev && !options.next) {
                options.prev.options.next = view;
                view.$el.insertAfter(options.prev.$el);
            } else if (options.next && !options.prev) {
                options.next.options.prev = view;
                view.$el.insertBefore(options.next.$el);
            } else {
                view.$el.appendTo(this.$el);
            }
            return view;
        };

        return SlidingWindow;

    })(Marionette.View);

    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty,
        bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        };

    Uberbox.CarouselItem = (function(superClass) {
        extend(CarouselItem, superClass);

        function CarouselItem() {
            return CarouselItem.__super__.constructor.apply(this, arguments);
        }

        CarouselItem.prototype.template = function() {
            return Uberbox.Templates['carousel-item'];
        };

        CarouselItem.prototype.className = 'uberbox-carousel-item';

        CarouselItem.prototype.padding = 15;

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
                _.defer((function(_this) {
                    return function() {
                        return _this.trigger('load');
                    };
                })(this));
            }
            return this.$el.find('img').on('load', (function(_this) {
                return function() {
                    return _this.trigger('load');
                };
            })(this));
        };

        CarouselItem.prototype.layoutContent = function() {};

        CarouselItem.prototype.hideLoader = function() {
            return this.ui.loader.remove();
        };

        CarouselItem.prototype.layout = function() {
            if (this.model.isActive()) {
                this.calculateCoordinatesAsCurrent();
            } else if (this.model.follows(this.model.collection.activeItem)) {
                this.calculateCoordinatesAsNext();
            } else if (this.model.precedes(this.model.collection.activeItem)) {
                this.calculateCoordinatesAsPrev();
            }
            if (this.loaded) {
                this.layoutContent();
            }
            return this.applyLayout();
        };

        CarouselItem.prototype.getNext = function() {
            return this.getOption('next');
        };

        CarouselItem.prototype.getPrev = function() {
            return this.getOption('prev');
        };

        CarouselItem.prototype.remove = function() {
            var next, prev;
            this.$el.find('img').off('load', this.onImageLoaded);
            this.$el.remove();
            if (next = this.getOption('next')) {
                next.options.prev = null;
            }
            if (prev = this.getOption('prev')) {
                return prev.options.next = null;
            }
        };

        CarouselItem.prototype.fits = function() {
            if (this.belongs()) {
                return true;
            }
            if (this.top < this.getParent().height() && this.top + this.$el.height() > 0 && this.left + this.$el.width() > 0 && this.left < this.getParent().width() && this.top < this.getParent().height()) {
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

    Uberbox.VerticalCarouselItem = (function(superClass) {
        extend(VerticalCarouselItem, superClass);

        function VerticalCarouselItem() {
            return VerticalCarouselItem.__super__.constructor.apply(this, arguments);
        }

        VerticalCarouselItem.prototype.calculateCoordinatesAsPrev = function() {
            var next;
            if (!(next = this.getOption('next'))) {
                return;
            }
            this.left = this.padding;
            this.width = this.getParent().width() - this.padding * 2;
            this.height = this.getHeightInVerticalMode();
            return this.top = next.top - this.padding - this.height;
        };

        VerticalCarouselItem.prototype.calculateCoordinatesAsNext = function() {
            var prev;
            if (!(prev = this.getOption('prev'))) {
                return;
            }
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

    Uberbox.HorizontalCarouselItem = (function(superClass) {
        extend(HorizontalCarouselItem, superClass);

        function HorizontalCarouselItem() {
            return HorizontalCarouselItem.__super__.constructor.apply(this, arguments);
        }

        HorizontalCarouselItem.prototype.calculateCoordinatesAsPrev = function() {
            var next;
            if (!(next = this.getOption('next'))) {
                return;
            }
            this.height = this.getParent().height() - this.padding * 2;
            this.width = this.getWidthInHorizontalMode();
            this.left = next.left - this.width - this.padding;
            return this.top = this.padding;
        };

        HorizontalCarouselItem.prototype.calculateCoordinatesAsNext = function() {
            var prev;
            if (!(prev = this.getOption('prev'))) {
                return;
            }
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

    Uberbox.Carousel = (function(superClass) {
        extend(Carousel, superClass);

        function Carousel() {
            this.layout = bind(this.layout, this);
            this.waitForFirst = bind(this.waitForFirst, this);
            this.waitForLast = bind(this.waitForLast, this);
            this.buildPrev = bind(this.buildPrev, this);
            this.buildNext = bind(this.buildNext, this);
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

        Carousel.prototype.hide = function() {
            var item;
            if (!this.currentItemView) {
                return;
            }
            this.currentItemView.remove();
            item = this.currentItemView;
            while (item = item.getOption('next')) {
                item.remove();
            }
            item = this.currentItemView;
            while (item = item.getOption('prev')) {
                item.remove();
            }
            return this.currentItemView = null;
        };

        Carousel.prototype.build = function(item) {};

        Carousel.prototype.buildNext = function(last) {
            var next;
            if (this.belongs(last) && last.model.next() && !last.getNext()) {
                next = this.createChildView(last.model.next(), {
                    prev: last
                });
                return next.runAction((function(_this) {
                    return function() {
                        next.layout();
                        return _this.buildNext(next);
                    };
                })(this));
            }
        };

        Carousel.prototype.buildPrev = function(first) {
            var prev;
            if (this.belongs(first) && first.model.prev() && !first.getPrev()) {
                prev = this.createChildView(first.model.prev(), {
                    next: first
                });
                return prev.runAction((function(_this) {
                    return function() {
                        prev.layout();
                        return _this.buildPrev(prev);
                    };
                })(this));
            }
        };

        Carousel.prototype.waitForLast = function(last, lastCallback) {
            return last.runAction((function(_this) {
                return function() {
                    if (last.getNext()) {
                        return _this.waitForLast(last.getNext(), lastCallback);
                    } else {
                        return lastCallback(last);
                    }
                };
            })(this));
        };

        Carousel.prototype.waitForFirst = function(first, firstCallback) {
            return first.runAction((function(_this) {
                return function() {
                    if (first.getPrev()) {
                        return _this.waitForFirst(first.getPrev(), firstCallback);
                    } else {
                        return firstCallback(first);
                    }
                };
            })(this));
        };

        Carousel.prototype.isHorizontal = function() {
            return this.getOption('orientation') === 'horizontal';
        };

        Carousel.prototype.fits = function(item) {
            var height, parent, width;
            parent = this.$el.parent();
            if (this.isHorizontal()) {
                width = parent.width();
                return this.translateX + item.left + item.width > 0 && this.translateX + item.left < width;
            } else {
                height = parent.height();
                return this.translateY + item.top + item.height > 0 && this.translateY + item.top < height;
            }
        };

        Carousel.prototype.belongs = function(item) {
            var height, parent, width;
            parent = this.$el.parent();
            if (this.isHorizontal()) {
                width = parent.width();
                return this.translateX + item.left + item.width < width && this.translateX + item.left > 0;
            } else {
                height = parent.height();
                return this.translateY + item.top + item.height < height && this.translateY + item.top > 0;
            }
        };

        Carousel.prototype.translateToCurrent = function() {
            var offset;
            if (this.isHorizontal()) {
                offset = this.currentItemView.left;
                this.translateX = this.$el.parent().width() / 2 - offset - this.currentItemView.$el.width() / 2;
                return this.$el.css({
                    transform: "translate(" + this.translateX + "px, 0px)"
                });
            } else {
                offset = this.currentItemView.top;
                this.translateY = this.$el.parent().height() / 2 - offset - this.currentItemView.$el.height / 2;
                return this.$el.css({
                    transform: "translate(0px, " + this.translateY + "px)"
                });
            }
        };

        Carousel.prototype.layout = function() {
            if (!this.currentItemView) {
                this.currentItemView = this.createChildView(this.collection.activeItem);
            }
            return this.currentItemView.runAction((function(_this) {
                return function() {
                    _this.translateToCurrent();
                    _this.waitForLast(_this.currentItemView, function(last) {
                        var results;
                        if (last && !_this.fits(last)) {
                            results = [];
                            while (last && !_this.fits(last)) {
                                last.remove();
                                results.push(last = last.getPrev());
                            }
                            return results;
                        } else {
                            return _this.buildNext(last);
                        }
                    });
                    return _this.waitForFirst(_this.currentItemView, function(first) {
                        var results;
                        if (first && !_this.fits(first)) {
                            results = [];
                            while (first && !_this.fits(first)) {
                                first.remove();
                                results.push(first = first.getNext());
                            }
                            return results;
                        } else {
                            return _this.buildPrev(first);
                        }
                    });
                };
            })(this));
        };

        Carousel.prototype.onItemActivated = function(item) {
            var next, prev;
            if (this.currentItemView && item === this.currentItemView.model) {
                return;
            }
            if (!this.currentItemView) {
                this.currentItemView = this.createChildView(item);
                this.currentItemView.layout();
                this.layout();
                return;
            }
            if (next = this.currentItemView.getNextToScrollTo(item)) {
                this.currentItemView = next;
                return this.layout();
            } else if (prev = this.currentItemView.getPrevToScrollTo(item)) {
                this.currentItemView = prev;
                return this.layout();
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
                this.currentItemView.layout();
                this.currentItemView = this.createChildView(item);
                return this.layout();
            }
        };

        return Carousel;

    })(Uberbox.SlidingWindow);

    var extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty;

    Uberbox.ToolbarView = (function(superClass) {
        extend(ToolbarView, superClass);

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
            download: '*[data-action=download]',
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
            'click @ui.download': 'onDownloadClick',
            'click .uberbox-share-overlay': 'onShareClick'
        };

        ToolbarView.prototype.serializeData = function() {
            return {
                model: this.model
            };
        };

        ToolbarView.prototype.onShow = function() {
            return _.defer((function(_this) {
                return function() {
                    return _this.$el.addClass('uberbox-visible');
                };
            })(this));
        };

        ToolbarView.prototype.onFullscreenClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.ui.fullscreen.addClass('uberbox-disabled');
            this.ui.exitFullscreen.removeClass('uberbox-disabled');
            return Uberbox.Utils.enterFullscreen(document.documentElement);
        };

        ToolbarView.prototype.onDownloadClick = function(e) {
            return Uberbox.Utils.notification({
                message: this.model.get('download_started_tooltip')
            });
        };

        ToolbarView.prototype.onExitFullscreenClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.ui.exitFullscreen.addClass('uberbox-disabled');
            this.ui.fullscreen.removeClass('uberbox-disabled');
            return Uberbox.Utils.exitFullscreen();
        };

        ToolbarView.prototype.onCloseClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return this.model.trigger('close');
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

        return ToolbarView;

    })(Marionette.ItemView);

    var ObjectView,
        bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty;

    ObjectView = (function(superClass) {
        extend(ObjectView, superClass);

        function ObjectView() {
            this.onObjectLoaded = bind(this.onObjectLoaded, this);
            this.onObjectError = bind(this.onObjectError, this);
            this.fadeIn = bind(this.fadeIn, this);
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

        ObjectView.prototype.getOffset = function() {
            var offset;
            offset = this.$el.offset();
            offset.top -= jQuery(window).scrollTop();
            return offset;
        };

        return ObjectView;

    })(Marionette.ItemView);

    Uberbox.ImageObjectView = (function(superClass) {
        extend(ImageObjectView, superClass);

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

        ImageObjectView.prototype.getOffset = function() {
            var offset;
            offset = this.ui.image.offset();
            return {
                left: offset.left,
                top: offset.top - jQuery(window).scrollTop()
            };
        };

        ImageObjectView.prototype.getWidth = function() {
            return this.ui.image.width();
        };

        return ImageObjectView;

    })(ObjectView);

    Uberbox.IframeObjectView = (function(superClass) {
        extend(IframeObjectView, superClass);

        function IframeObjectView() {
            this.onWindowResized = bind(this.onWindowResized, this);
            return IframeObjectView.__super__.constructor.apply(this, arguments);
        }

        IframeObjectView.prototype.waitForLoad = true;

        IframeObjectView.prototype.supportsOversizing = false;

        IframeObjectView.prototype.className = 'uberbox-iframe-content';

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
            return this.ui.iframe.height(Math.min(this.ui.iframe.width() / this.getObjectNaturalAspectRatio(), this.$el.height()));
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

    Uberbox.YoutubeObjectView = (function(superClass) {
        extend(YoutubeObjectView, superClass);

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

    Uberbox.VimeoObjectView = (function(superClass) {
        extend(VimeoObjectView, superClass);

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

    Uberbox.GoogleMapsObjectView = (function(superClass) {
        extend(GoogleMapsObjectView, superClass);

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

    Uberbox.SoundcloudObjectView = (function(superClass) {
        extend(SoundcloudObjectView, superClass);

        function SoundcloudObjectView() {
            return SoundcloudObjectView.__super__.constructor.apply(this, arguments);
        }

        SoundcloudObjectView.prototype.className = 'uberbox-iframe-content uberbox-soundcloud-content';

        SoundcloudObjectView.prototype.getIframeUrl = function() {
            return "//w.soundcloud.com/player/?url=" + encodeURIComponent(this.model.get('url'));
        };

        return SoundcloudObjectView;

    })(Uberbox.IframeObjectView);

    Uberbox.BandcampObjectView = (function(superClass) {
        extend(BandcampObjectView, superClass);

        function BandcampObjectView() {
            return BandcampObjectView.__super__.constructor.apply(this, arguments);
        }

        BandcampObjectView.prototype.className = 'uberbox-iframe-content uberbox-bandcamp-content';

        BandcampObjectView.prototype.getIframeUrl = function() {
            return this.model.get('url');
        };

        return BandcampObjectView;

    })(Uberbox.IframeObjectView);

    Uberbox.HTMLObjectView = (function(superClass) {
        extend(HTMLObjectView, superClass);

        function HTMLObjectView() {
            return HTMLObjectView.__super__.constructor.apply(this, arguments);
        }

        HTMLObjectView.prototype.className = 'uberbox-html-content';

        HTMLObjectView.prototype.waitForLoad = false;

        HTMLObjectView.prototype.template = function() {
            return Uberbox.Templates['content-html'];
        };

        HTMLObjectView.prototype.getObjectNaturalWidth = function() {
            return 650;
        };

        HTMLObjectView.prototype.getObjectNaturalHeight = function() {
            return 400;
        };

        return HTMLObjectView;

    })(ObjectView);

    Uberbox.AJAXOBjectView = (function(superClass) {
        extend(AJAXOBjectView, superClass);

        function AJAXOBjectView() {
            this.layout = bind(this.layout, this);
            return AJAXOBjectView.__super__.constructor.apply(this, arguments);
        }

        AJAXOBjectView.prototype.className = 'uberbox-ajax-content';

        AJAXOBjectView.prototype.waitForLoad = true;

        AJAXOBjectView.prototype.template = function() {
            return Uberbox.Templates['content-html'];
        };

        AJAXOBjectView.prototype.bindUIElements = function() {
            AJAXOBjectView.__super__.bindUIElements.apply(this, arguments);
            jQuery.get(this.model.get('url'), (function(_this) {
                return function(response) {
                    _this.$el.html(response);
                    _this.trigger('load');
                    return _this.layout();
                };
            })(this));
            return jQuery(window).on('resize', this.layout);
        };

        AJAXOBjectView.prototype.layout = function() {
            if (this.$el.height() < this.$el.parent().height()) {
                return this.$el.addClass('uberbox-center-vertical');
            } else {
                return this.$el.addClass('uberbox-scroll').removeClass('uberbox-center-vertical');
            }
        };

        return AJAXOBjectView;

    })(ObjectView);

    Uberbox.UnknownItemView = (function(superClass) {
        extend(UnknownItemView, superClass);

        function UnknownItemView() {
            return UnknownItemView.__super__.constructor.apply(this, arguments);
        }

        UnknownItemView.prototype.className = 'uberbox-unknown-content';

        UnknownItemView.prototype.template = function() {
            return Uberbox.Templates['content-unknown'];
        };

        UnknownItemView.prototype.waitForLoad = false;

        UnknownItemView.prototype.showContent = function() {};

        UnknownItemView.prototype.getObjectNaturalWidth = function() {
            return this.$el.parent().width();
        };

        UnknownItemView.prototype.getObjectNaturalHeight = function() {
            return this.$el.parent().height();
        };

        return UnknownItemView;

    })(ObjectView);

    var bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        },
        extend = function(child, parent) {
            for (var key in parent) {
                if (hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },
        hasProp = {}.hasOwnProperty;

    Uberbox.Lightbox = (function(superClass) {
        extend(Lightbox, superClass);

        function Lightbox() {
            this.layout = bind(this.layout, this);
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
            })
        };

        Lightbox.prototype.getChildViewClass = function() {
            return Uberbox.LightboxItem;
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
                this.currentItemView = this.createChildView(item);
                if (item.next()) {
                    this.nextItemView = this.createChildView(item.next(), {
                        prev: this.currentItemView
                    });
                }
                if (item.prev()) {
                    this.prevItemView = this.createChildView(item.prev(), {
                        prev: this.currentItemView
                    });
                }
            } else {
                if (item.follows(this.currentItemView.model)) {
                    this.scrollNext(item);
                } else {
                    this.scrollPrev(item);
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

        Lightbox.prototype.scrollNext = function(item) {
            var current, previousCurrent;
            if (this.prevItemView) {
                this.prevItemView.remove();
            }
            if (this.currentItemView.model.isPrev(item)) {
                this.prevItemView = this.currentItemView;
                this.prevItemView.layout();
                this.currentItemView = this.nextItemView;
                this.currentItemView.layout();
                this.currentItemView = this.nextItemView;
                if (this.currentItemView.model.next()) {
                    return this.nextItemView = this.createChildView(this.currentItemView.model.next(), {
                        prev: this.currentItemView
                    });
                } else {
                    return this.nextItemView = null;
                }
            } else {
                if (this.nextItemView) {
                    this.nextItemView.remove();
                }
                previousCurrent = this.currentItemView;
                previousCurrent.layout();
                setTimeout((function() {
                    return previousCurrent.remove();
                }), 500);
                current = this.currentItemView = this.createChildView(item);
                if (item.prev()) {
                    this.prevItemView = this.createChildView(item.prev(), {
                        next: this.currentItemView
                    });
                }
                if (item.next()) {
                    return this.nextItemView = this.createChildView(item.next(), {
                        prev: this.currentItemView
                    });
                }
            }
        };

        Lightbox.prototype.scrollPrev = function(item) {
            var current, previousCurrent;
            if (this.nextItemView) {
                this.nextItemView.remove();
            }
            if (this.currentItemView.model.isNext(item)) {
                this.nextItemView = this.currentItemView;
                this.nextItemView.layout();
                this.currentItemView = this.prevItemView;
                this.currentItemView.layout();
                this.currentItemView = this.prevItemView;
                if (this.currentItemView.model.prev()) {
                    return this.prevItemView = this.createChildView(this.currentItemView.model.prev(), {
                        next: this.currentItemView
                    });
                } else {
                    return this.prevItemView = null;
                }
            } else {
                if (this.prevItemView) {
                    this.prevItemView.remove();
                }
                previousCurrent = this.currentItemView;
                previousCurrent.layout();
                setTimeout((function() {
                    return previousCurrent.remove();
                }), 500);
                current = this.currentItemView = this.createChildView(item);
                if (item.next()) {
                    this.nextItemView = this.createChildView(item.next(), {
                        prev: this.currentItemView
                    });
                }
                if (item.prev()) {
                    return this.prevItemView = this.createChildView(item.prev(), {
                        next: this.currentItemView
                    });
                }
            }
        };

        Lightbox.prototype.layout = function() {
            if (!this.$el.is(':visible')) {
                return;
            }
            this.currentItemView.layout();
            return _.defer((function(_this) {
                return function() {
                    if (_this.nextItemView) {
                        _this.nextItemView.layout();
                    }
                    if (_this.prevItemView) {
                        return _this.prevItemView.layout();
                    }
                };
            })(this));
        };

        return Lightbox;

    })(Uberbox.SlidingWindow);

    Uberbox.LightboxItem = (function(superClass) {
        extend(LightboxItem, superClass);

        function LightboxItem() {
            this.remove = bind(this.remove, this);
            this.layoutContent = bind(this.layoutContent, this);
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
            content: '> .uberbox-lightbox-item-content-wrapper',
            description: '.uberbox-item-description'
        };

        LightboxItem.prototype.padding = 20;

        LightboxItem.prototype.initialize = function() {
            LightboxItem.__super__.initialize.apply(this, arguments);
            return this.once('load', (function(_this) {
                return function() {
                    return _this.model.set('loaded', true);
                };
            })(this));
        };

        LightboxItem.prototype.serializeData = function() {
            return {
                model: this.model
            };
        };

        LightboxItem.prototype.layoutContent = function() {
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
            var offset;
            if (this.model.get('description_style') === 'mini') {
                return this.object.currentView.getOffset();
            }
            offset = this.ui.content.offset();
            offset.top -= jQuery(window).scrollTop();
            return offset;
        };

        LightboxItem.prototype.getWidth = function() {
            if (this.model.get('description_style') === 'bottom') {
                return this.object.currentView.$el.width();
            }
            if (this.model.get('description_style') === 'mini') {
                return this.object.currentView.getWidth();
            }
            return this.ui.content.width();
        };

        LightboxItem.prototype.swipeVertically = function(amount) {
            return this.$el.css({
                transform: "translate(0, " + amount + "px)",
                '-webkit-transform': "translate(0, " + amount + "px)",
                '-moz-transform': "translate(0, " + amount + "px)"
            });
        };

        LightboxItem.prototype.swipeHorizontally = function(amount) {
            return this.$el.css({
                transform: "translate(" + amount + "px, 0)",
                '-webkit-transform': "translate(" + amount + "px, 0)",
                '-moz-transform': "translate(" + amount + "px, 0)"
            });
        };

        LightboxItem.prototype.swipeBack = function() {
            return this.$el.css({
                transform: "translate(0, 0)"
            });
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
                availableRatio = objectView.$el.width() / objectView.$el.height();
                objectRatio = objectView.getObjectNaturalAspectRatio();
                if (availableRatio > objectRatio) {
                    return this.fitHeight();
                } else {
                    return this.fitWidth();
                }
            }
        };

        LightboxItem.prototype.layoutWithDescriptionAtRight = function() {
            var availableAreaAspectRatio, availableAreaWidth, containerHeight, content, contentHeight, height, objectAspectRatio, width;
            if (!this.object.currentView.supportsOversizing) {
                this.$el.addClass('uberbox-skin-dark');
                return;
            }
            width = this.$el.width();
            height = this.$el.height();
            if (jQuery(window).width() < 1024) {
                containerHeight = this.$('.uberbox-item-object > *').height();
                contentHeight = (content = this.$('.uberbox-item-object > * > *')).height();
                if (containerHeight < contentHeight) {
                    return content.css('margin-top', -(contentHeight - containerHeight) / 2);
                }
            } else {
                objectAspectRatio = this.object.currentView.getObjectNaturalAspectRatio();
                availableAreaWidth = width - this.ui.description.width();
                availableAreaAspectRatio = availableAreaWidth / height;
                return this.fitOversized();
            }
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

        LightboxItem.prototype.showRegions = function() {
            var type;
            type = Uberbox.getObjectViewType(this.model);
            if (this.model.get('description') && this.model.get('description_style') !== 'none') {
                this.$el.addClass('uberbox-has-description');
                this.$el.addClass("uberbox-description-" + (this.model.get('description_style')));
            } else {
                this.$el.addClass('uberbox-no-description');
            }
            this.object.show(new type(_.extend(this.options, {
                model: this.model
            })));
            if (this.object.currentView.waitForLoad) {
                return this.listenToOnce(this.object.currentView, 'load', (function(_this) {
                    return function() {
                        return _this.trigger('load');
                    };
                })(this));
            } else {
                return _.defer((function(_this) {
                    return function() {
                        return _this.trigger('load');
                    };
                })(this));
            }
        };

        LightboxItem.prototype.layout = function() {
            if (this.isCurrent()) {
                this.positionAsCurrent();
            } else if (this.isNext()) {
                this.positionAsNext();
            } else if (this.isPrev()) {
                this.positionAsPrev();
            } else {
                setTimeout(this.remove, 400);
                return;
            }
            return this.layoutContent();
        };

        LightboxItem.prototype.isVertical = function() {
            return this.getOption('orientation') === 'vertical';
        };

        LightboxItem.prototype.positionAsCurrent = function() {
            return this.$el.css({
                transform: ''
            });
        };

        LightboxItem.prototype.positionAsNext = function() {
            if (this.isVertical()) {
                return this.$el.css({
                    transform: "translate(0, " + (jQuery(window).height()) + "px)"
                });
            } else {
                return this.$el.css({
                    transform: "translate(" + (jQuery(window).width()) + "px, 0)"
                });
            }
        };

        LightboxItem.prototype.positionAsPrev = function() {
            if (this.isVertical()) {
                return this.$el.css({
                    transform: "translate(0, -" + (jQuery(window).height()) + "px)"
                });
            } else {
                return this.$el.css({
                    transform: "translate(-" + (jQuery(window).width()) + "px, 0)"
                });
            }
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

    if (root.Uberbox) {
        Uberbox.Templates = root.Uberbox.Templates;
    }
    return Uberbox;
}));
