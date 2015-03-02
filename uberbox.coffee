class window.Uberbox extends Marionette.LayoutView
	template: '#uberbox-template-main'
	regions:
		lightbox: '.uberbox-lightbox-wrapper'
		carousel: '.uberbox-carousel-wrapper'
	ui:{}
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
		@lightbox.show(new Lightbox(lightboxOptions))
		#@carousel.show(new Carousel(collection: @collection))
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
		if (e.which == 37 and @getOption('orientation') == 'horizontal' or e.which == 38 and @getOption('orientation') == 'vertical')
			@collection.prev()
			return false
		if e.which == 40 and @getOption('orientation') == 'vertical' or e.which == 39 and @getOption('orientation') == 'horizontal'
			@collection.next()
			return false
	showOverlay: ->
		@ui.overlay = jQuery('<div class="uberbox-overlay" />').appendTo(jQuery('body'))
		_.defer => @ui.overlay.addClass 'visible'
		@ui.overlay.on 'click', => @remove()

class LightboxItem extends Backbone.Model
	activate: ->
		@collection.activeItem = this
		@trigger('activate', this)
class window.LightboxCollection extends Backbone.Collection
	model: LightboxItem
	initialize: ->
		super
		@on 'add', (item)-> @listenTo item, 'activate', @onItemActivated
		@on 'remove', (item)-> @stopListeningTo item, 'activate', @onItemActivated

	next: ->
		index = @indexOf(@activeItem)
		return if index == @length - 1
		@at(index + 1).activate()
	prev: ->
		index = @indexOf(@activeItem)
		return if index == 0
		@at(index - 1).activate()

class LightboxItemView extends Marionette.ItemView
	template:'#uberbox-template-lightbox-item'
	className: 'uberbox-lightbox-item'
	events:
		click: 'onClicked'
	initialize: ->
		super
		@$el.appendTo(@getOption('container').$el)
		@render()
		_.defer => @fadeIn()
		jQuery(window).resize => @layout()
	fadeOut: ->
		@$el.removeClass('uberbox-visible')
		setTimeout((=>@remove()), 600)
	fadeIn: ->
		@$el.addClass('uberbox-visible')
	flyOutPrev: ->
		@$el.addClass('uberbox-fled-prev').removeClass('uberbox-visible')
		setTimeout((=>@remove()), 600)
	flyOutNext: ->
		@$el.addClass('uberbox-fled-next').removeClass('uberbox-visible')
		setTimeout((=>@remove()), 600)
	makePrev: ->
		@$el.addClass('uberbox-lightbox-prev').removeClass('uberbox-lightbox-next').removeClass('uberbox-lightbox-current')
		@layout()
	makeNext: ->
		@$el.addClass('uberbox-lightbox-next').removeClass('uberbox-lightbox-prev').removeClass('uberbox-lightbox-current')
		@layout()
	makeCurrent: ->
		@$el.removeClass('uberbox-lightbox-prev').removeClass('uberbox-lightbox-next').addClass('uberbox-lightbox-current')
		@layout()
	getOrientation: -> @getOption('container').getOption('orientation')
	padding: 40
	bottomBarHeight: 120
	sidebarWidth: 160
	layout: ->
		if @isCurrent()
			if @getOrientation() == 'vertical'
				@$el.css(left: @padding + 'px', right: @padding + 'px', top: @padding * 3 + 'px', height: @getOption('container').$el.height() - @sidebarWidth - @padding * 2, bottom: 'auto')
			else
				@$el.css(left: @padding * 4 + 'px', bottom: @padding + 'px', top: @padding + 'px', width: @getOption('container').$el.width() - @padding * 8, right: 'auto')
		else if @isPrev()
			if @getOrientation() == 'vertical'
				height = @$el.height() - @sidebarWidth
				@$el.css(left: @padding + 'px', right: @padding + 'px', top: (@padding * 2 - height) + "px", height: height, bottom: 'auto')
			else
				width = @getOption('container').$el.width() - @bottomBarHeight
				@$el.css(left: (@padding * 2 - width) + "px", bottom: @padding + 'px', top: @padding + 'px', width: width, right: 'auto')
		else if @isNext()
			if @getOrientation() == 'vertical'
				height = @getOption('container').$el.height() - @sidebarWidth
				@$el.css(left: @padding + 'px', right: @padding + 'px', bottom: (@padding * 2 - height) + "px", height: height, top: 'auto')
			else
				width = @getOption('container').$el.width() - @bottomBarHeight
				@$el.css(right: (@padding * 2 - width) + "px", bottom: @padding + 'px', top: @padding + 'px', width: width, left: 'auto')





	isCurrent: -> @$el.hasClass('uberbox-lightbox-current')
	isPrev: -> @$el.hasClass('uberbox-lightbox-prev')
	isNext: -> @$el.hasClass('uberbox-lightbox-next')
	onClicked: ->
		return
		if @$el.hasClass('uberbox-lightbox-prev') or @$el.hasClass('uberbox-lightbox-next')
			@model.activate()

class Lightbox extends Marionette.ItemView
	template: '#uberbox-template-lightbox'
	className: 'uberbox-lightbox-content'
	constructor: (options)->
		super _.extend({current: 0}, options)
		@listenTo @collection, 'activate', @activate

	activate: (item)->
		return if @currentItemView and item == @currentItemView.model
		if !@currentItemView or Math.abs(@collection.indexOf(item) - @collection.indexOf(@currentItemView.model)) > 1
			@crossFade(item)
		else if @collection.indexOf(item) - @collection.indexOf(@currentItemView.model) == 1
			@scrollNext()
		else
			@scrollPrev()
	scrollNext: ->
		if @prevItemView
			@prevItemView.flyOutPrev()
			delete @prevItemView
		@currentItemView.makePrev()
		@prevItemView = @currentItemView
		if @nextItemView
			@nextItemView.makeCurrent()
			@currentItemView = @nextItemView
		if @collection.indexOf(@currentItemView.model) < @collection.length - 1
			@nextItemView = new LightboxItemView(model: @collection.at(@collection.indexOf(@currentItemView.model) + 1), container: this)
			@nextItemView.makeNext()
		else
			@nextItemView = null
	scrollPrev: ->
		if @nextItemView
			@nextItemView.flyOutNext()
			delete @nextItemView
		@currentItemView.makeNext()
		@nextItemView = @currentItemView
		if @prevItemView
			@prevItemView.makeCurrent()
			@currentItemView = @prevItemView
		if @collection.indexOf(@currentItemView.model) > 0
			@prevItemView = new LightboxItemView(model: @collection.at(@collection.indexOf(@currentItemView.model) - 1), container: this)
			@prevItemView.makePrev()
		else
			@prevItemView = null

	crossFade: (item)->
		if @currentItemView
			@currentItemView.fadeOut(item)
		if @prevItemView
			@prevItemView.fadeOut()
			delete @prevItemView
		else if @collection.indexOf(item) > 0
			@prevItemView = new LightboxItemView(model: @collection.at(@collection.indexOf(item) - 1), container: this)
			@prevItemView.makePrev()
		if @nextItemView
			@nextItemView.fadeOut()
			delete @nextItemView
		else if @collection.indexOf(item) < @collection.length - 1
			@nextItemView = new LightboxItemView(model: @collection.at(@collection.indexOf(item) + 1), container: this)
			@nextItemView.makeNext()
		@currentItemView = new LightboxItemView(model: item, container: this)
		@currentItemView.makeCurrent()
	onShow: ->
		@collection.at(@getOption('current')).activate()

