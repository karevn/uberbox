class Uberbox extends Marionette.LayoutView
	@instances = []
	template: -> Uberbox.Templates.uberbox
	regions:
		lightbox: '.uberbox-lightbox-wrapper'
		carousel: '.uberbox-carousel-wrapper'
	ui:{}
	events:
		touchstart: 'onTouchStart'
		touchmove: 'onTouchMove'
		touchend: 'onTouchEnd'
	onTouchStart: (e)=>
		@touchStartedAt = 
			left: e.originalEvent.pageX
			top: e.originalEvent.pageY
	onTouchMove: (e)=>
		threshold = 10
		original = e.originalEvent
		diffX = original.pageX - @touchStartedAt.left
		diffY = original.pageY - @touchStartedAt.top
		if @getOption('orientation') == 'horizontal' and Math.abs(diffX) > Math.abs(diffY) and Math.abs(diffX) > threshold
			@lightbox.currentView.currentItemView.swipeHorizontally(if diffX > 0 then diffX - threshold else diffX + threshold)
			e.preventDefault()
		else if @getOption('orientation') == 'vertical' and Math.abs(diffY) > Math.abs(diffX) and Math.abs(diffY) > threshold
			@lightbox.currentView.currentItemView.swipeVertically(if diffY > 0 then diffY - threshold else diffY + threshold)
			e.preventDefault()
		else
			@lightbox.currentView.currentItemView.swipeBack()
			if @collection.activeItem.get('description_style') == 'mini'
				e.preventDefault()
			else
				e.stopPropagation()
			
	shouldBotherWithTouch: (e)->
		@getOption('orientation') == 'horizontal' and Math.abs() > threshold or
			@getOption('orientation') == 'vertical' and Math.abs(e.pageY - @touchStartedAt.top) > threshold
	onTouchEnd: (e)=>
		original = e.originalEvent
		threshold = 40
		diffX = original.pageX - @touchStartedAt.left
		diffY = original.pageY - @touchStartedAt.top
		if @getOption('orientation') == 'horizontal'
			if diffX > threshold and @lightbox.currentView.currentItemView.model.prev()
				@lightbox.currentView.currentItemView.swipeBack()
				@lightbox.currentView.currentItemView.model.prev().activate()
			if diffX <  -threshold and @lightbox.currentView.currentItemView.model.next()
				@lightbox.currentView.currentItemView.swipeBack()
				@lightbox.currentView.currentItemView.model.next().activate()
		if @getOption('orientation') == 'vertical'
			if diffY > threshold and @lightbox.currentView.currentItemView.model.prev()
				@lightbox.currentView.currentItemView.swipeBack()
				@lightbox.currentView.currentItemView.model.prev().activate()
			if diffY <  -threshold and @lightbox.currentView.currentItemView.model.next()
				@lightbox.currentView.currentItemView.swipeBack()
				@lightbox.currentView.currentItemView.model.next().activate()
		@lightbox.currentView.currentItemView.swipeBack()
				
			
		@touchStartedAt = null
	@contentViewTypes: ->
		image:
			condition: /\.(gif|png|jpeg|jpg)$/i
			class: Uberbox.ImageObjectView
		youtube:
			condition: /((\(\/\/)?(www\.)?youtube\.com\/watch\?v=.+)|((\/\/)(www\.)?youtu\.be\/.*)/i
			class: Uberbox.YoutubeObjectView
		vimeo:
			condition: /(\/\/)?vimeo\.com\/\d+/i
			class: Uberbox.VimeoObjectView
		soundcloud:
			condition: /soundcloud\.com/i
			class: Uberbox.SoundcloudObjectView
		bandcamp:
			condition: /bandcamp\.com/i
			class: Uberbox.BandcampObjectView
		iframe:
			condition: /(\/|\.html|\.htm|\.php|.aspx)$/i
			class: Uberbox.IframeObjectView
		gmap:
			condition: /(google\.(\w+)\/maps\/)|(maps\.google\.(\w+))|(goo\.gl\/maps\/)/i
			class: Uberbox.GoogleMapsObjectView
		html:
			condition: (item)-> !!item.get('html')
			class: Uberbox.HTMLObjectView
		unknown:
			class: Uberbox.UnknownItemView
				
	@show: (items, options = {})->
		jQuery('html').css('')
		options = _.extend({
			current: 0
			orientation: 'vertical'
			collection: new Uberbox.ItemCollection(items)
			carousel: false
		}, options)
		return unless items and items.length > 0
		@instances.push uberbox = new Uberbox(options)
		uberbox
	@close: ->
		if @instances.length > 0
			instance = @instances.pop()
			Uberbox.Utils.exitFullscreen() if Uberbox.Utils.isFullscreen()
			instance.remove()
			
	
	
	@getPixelRatio: -> if window.devicePixelRatio > 0 then window.devicePixelRatio else 1
	@getObjectViewType: (item)=>
		return @contentViewTypes[type] if type = item.get('type')
		for type, config of @contentViewTypes()
			condition = false
			if config.condition
				if _.isRegExp(config.condition) and url = item.get('url')
					condition = item.get('url').match(config.condition)
				if _.isFunction(config.condition)
					condition = config.condition(item)
			else
				condition = true
			return config.class if condition

	constructor: (options)->
		super _.extend {el: jQuery('<div class="uberbox" />').appendTo(jQuery('body'))}, options
	initialize: ->
		super
		@render()
		@bindUIElements()
		@$el.addClass("uberbox-#{@getOption('orientation')}")
		@showOverlay()

		lightboxOptions = _.extend {}, @options, {root: @$el}
		delete lightboxOptions.el
		@lightbox.show(new Uberbox.Lightbox(lightboxOptions))
		@listenTo(@lightbox.currentView, 'close', => @remove())
		if @getOption('carousel')
			@$el.addClass('uberbox-has-carousel')
			@carousel.show(new Uberbox.Carousel(lightboxOptions))
			jQuery(window).on 'resize.uberbox-main', =>
				if jQuery(window).width() < 1024
					@carousel.empty()
				else if !@carousel.currentView
					@carousel.show(new Uberbox.Carousel(lightboxOptions))
		else
			@$('.uberbox-carousel-wrapper').remove()
		@listenTo @getOption('collection'), 'close', => Uberbox.close()
		current = @getOption('collection').at(@getOption('current'))
		current.activate()
		jQuery('body').on 'keydown', @onKeyDown
		@overflow = jQuery('html').css('overflow')
		jQuery('html').css('overflow', 'hidden')
		
	remove: ->
		@trigger('close')
		super
		if Uberbox.Utils.isFullscreen()
			Uberbox.Utils.exitFullscreen()
		@ui.overlay.removeClass('visible')
		jQuery('body').off 'keydown.uberbox', @onKeyDown
		jQuery('html').css('overflow', @overflow)
		setTimeout((=> @ui.overlay.remove()), 600)
	onKeyDown: (e)=>
		if e.which == 27
			e.preventDefault()
			@remove()
		if (e.which == 37 or e.which == 38)
			@collection.activatePrev()
			return false
		if e.which == 40 or e.which == 39
			@collection.activateNext()
			return false
	showOverlay: ->
		@ui.overlay = jQuery('<div class="uberbox-overlay" />').appendTo(jQuery('body'))
		_.defer => @ui.overlay.addClass 'visible'
		@ui.overlay.on 'click', => @remove()
