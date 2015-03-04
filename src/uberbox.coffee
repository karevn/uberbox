class Uberbox extends Marionette.LayoutView
	@instances = []
	template: '#uberbox-template-main'
	regions:
		lightbox: '.uberbox-lightbox-wrapper'
		carousel: '.uberbox-carousel-wrapper'
	ui:{ }
	@factory: (backbone, marionette)->
		@Backbone = backbone
		@Marionette = marionette
		Uberbox

	@show: (items, options = {})->
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
			instance.remove()
	constructor: (options)->
		super _.extend {el: jQuery('<div class="uberbox" />').appendTo(jQuery('body'))}, options
	initialize: ->
		super
		@render()
		@bindUIElements()
		@$el.addClass("uberbox-#{@getOption('orientation')}")
		@showOverlay()
		lightboxOptions = _.clone(@options)
		delete lightboxOptions.el
		@lightbox.show(new Uberbox.Lightbox(lightboxOptions))
		if @getOption('carousel')
			@$el.addClass('uberbox-has-carousel')
			@carousel.show(new Uberbox.Carousel(lightboxOptions))
		jQuery('body').on 'keydown.uberbox', @onKeyDown
	remove: ->
		super
		@ui.overlay.removeClass('visible')
		jQuery('body').off 'keydown.uberbox', @onKeyDown
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
