class Uberbox.LightboxItem extends Uberbox.SlidingWindowItem
	defaults:
		description:
			position: 'right'
	template: -> Uberbox.Templates['lightbox-item']
	className: 'uberbox-lightbox-item'
	regions:
		object: '.uberbox-item-object'
		description: '.uberbox-item-description'
	ui:
		content: '> .uberbox-lightbox-item-content'
		description: '.uberbox-item-description'
	padding: 20
	initialize: ->
		super
		@once 'load', => @showContent()
			
	showContent: ->
		_.defer => 
			@layout()
			_.defer => 
				@$el.addClass('uberbox-visible')
	serializeData: -> {model: @model}
	layout: =>
		return if @waitForLoad and !@loaded
		width = @$el.width()
		height = @$el.height()
		return if width == 0 or height == 0
		if @model.get('description_style')== 'right' 
			@layoutWithDescriptionAtRight()
		else if @model.get('description_style') == 'mini'
			@layoutWithMiniDescription()
		else if @model.get('description_style') == 'bottom'
			@layoutWithDescriptionAtBottom()
	getOffset: ->
		offset = jQuery(@$el).offset()
		if @model.get('description_style') == 'bottom' || @model.get('description_style') == 'mini'
			left = @object.currentView.$el.offset().left
			return left: left, top: @object.currentView.$el.offset().top
		@object.currentView.$el.offset()
	getWidth: ->
		if @model.get('description_style') == 'bottom' || @model.get('description_style') == 'mini'
			return @object.currentView.$el.width()
		@object.currentView.$el.width() + @ui.description.outerWidth()
	layoutWithDescriptionAtBottom: ->
		unless @object.currentView.supportsOversizing
			@$el.addClass('uberbox-fit-height')
			return
		width = @object.$el.width()
		height = @object.$el.height()
		objectAspectRatio = @object.currentView.getObjectNaturalAspectRatio()
		availableAreaAspectRatio = width / height
		@fitOversized()
		if @$el.height() < @$el.parent().height()
			@$el.addClass('uberbox-center-vertically')
		else
			@$el.removeClass('uberbox-center-vertically')
	layoutWithMiniDescription: ->
		width = @object.$el.width()
		height = @object.$el.height()
		item = @$el.closest('.uberbox-lightbox-item')
		objectView = @object.currentView
		@$el.css('margin-left', '')
		if (objectView.getObjectNaturalWidth() < width and objectView.getObjectNaturalHeight() < height)
			@fitNaturally()
		else
			availableRatio = item.width() / (item.height() - if @description.currentView then @description.$el.outerHeight() else 0)
			objectRatio = objectView.getObjectNaturalAspectRatio()
			if availableRatio > objectRatio
				@fitHeight()
			else
				@fitWidth()
	layoutWithDescriptionAtRight: ->
		unless @object.currentView.supportsOversizing
			@$el.addClass('uberbox-skin-dark')
			return
		width = @$el.width()
		height = @$el.height()
		objectAspectRatio = @object.currentView.getObjectNaturalAspectRatio()
		availableAreaWidth = width - @ui.description.width()
		availableAreaAspectRatio = availableAreaWidth / height
		@fitOversized()
	fitHeight: ->
		@$el.addClass('uberbox-fit-height').removeClass('uberbox-fit-width uberbox-natural-fit uberbox-fit-oversized uberbox-fit-height-oversized uberbox-fit-width-oversized')
	fitWidth: ->
		@$el.addClass('uberbox-fit-width').removeClass('uberbox-fit-height uberbox-natural-fit uberbox-fit-oversized uberbox-fit-height-oversized uberbox-fit-width-oversized')

	fitNaturally: -> 
		@$el.removeClass('uberbox-fit-width uberbox-fit-height uberbox-natural-fit uberbox-fit-height-oversized uberbox-fit-width-oversized uberbox-fit-oversized').addClass('uberbox-natural-fit')
	fitOversized: ->
		@$el.addClass('uberbox-fit-oversized').removeClass('uberbox-fit-width uberbox-fit-height')
		if @object.currentView.getObjectNaturalAspectRatio() > @object.currentView.getAspectRatio()
			@$el.addClass('uberbox-fit-height-oversized').removeClass('uberbox-fit-width-oversized')
		else
			@$el.addClass('uberbox-fit-width-oversized').removeClass('uberbox-fit-height-oversized')
		
	hideLoader: ->
	showLoader: ->	
	showRegions: ->
		type = Uberbox.getObjectViewType(@model)
		if @model.get('description')
			@$el.addClass('uberbox-has-description')
			@$el.addClass("uberbox-description-#{@model.get('description_style')}")
		@object.show(new type(_.extend(@options, model: @model)))
		if @object.currentView.waitForLoad
			@showLoader()
			@listenToOnce @object.currentView, 'load', =>
				@trigger 'load'
				@hideLoader()
		else
			@trigger 'load'
			@showContent()
	layoutAsCurrent: ->
		@$el.css(transform: '')
		@layout()
	remove: ->
		if @model.isNext()
			@$el.addClass('uberbox-flyout-next')
		if @model.isPrev()
			@$el.addClass('uberbox-flyout-prev')
		if @getOption('next')
			@getOption('next').options.prev = null
		if @getOption('prev')
			@getOption('prev').options.next = null
		setTimeout((=>super()), 600)
	
		
class Uberbox.DownloadView extends Marionette.ItemView
	template: '#uberbox-template-download'
	
class Uberbox.VerticalLightboxItem extends Uberbox.LightboxItem
	layoutAsNext: ->
		@$el.css transform: "translate(0, #{jQuery(window).height()}px)"
		@layout()
	layoutAsPrev: ->
		@$el.css transform: "translate(0, -#{jQuery(window).height()}px)"
		@layout()
	
class Uberbox.HorizontalLightboxItem extends Uberbox.LightboxItem
	layoutAsNext: ->
		@$el.css transform: 'translate(120%, 0)'
		@layout()
	layoutAsPrev: ->
		@$el.css transform: 'translate(-120%, 0)'
		@layout()
	
class Uberbox.Lightbox extends Uberbox.SlidingWindow
	className: 'uberbox-lightbox-content'
	template: -> Uberbox.Templates['lightbox-content']
	ui:
		next: '.uberbox-next'
		prev: '.uberbox-prev'
	events:
		'click @ui.next': (-> @currentItemView.model.next().activate() unless @ui.next.is('.uberbox-disabled'))
		'click @ui.prev': (-> @currentItemView.model.prev().activate() unless @ui.prev.is('.uberbox-disabled'))
		'click @ui.close': -> @trigger 'close'
	
	getChildViewClass: -> 
		if @getOption('orientation') == 'horizontal' 
			return Uberbox.HorizontalLightboxItem 
		else 
			return Uberbox.VerticalLightboxItem
	onShow: ->
		super
		@render()
		@bindUIElements()
	render: -> @$el.html(Marionette.Renderer.render(@template))

		
	onItemActivated: (item)->
		if !@currentItemView
			@rebuild()
		else
			if item == @currentItemView.model.next()
				@scrollNext()
			else if item == @currentItemView.model.prev()
				@scrollPrev()
			else
				@rebuild()
		if @currentItemView.model.next()
			@ui.next.removeClass('uberbox-disabled')
		else
			@ui.next.addClass('uberbox-disabled')
		if @currentItemView.model.prev()
			@ui.prev.removeClass('uberbox-disabled')
		else
			@ui.prev.addClass('uberbox-disabled')
	checkPrevNext: ->
	rebuild: ->
		@currentItemView.remove() if @currentItemView
		@prevItemView.remove() if @prevItemView
		@nextItemView.remove() if @nextItemView
			
		@currentItemView = @createChildView(@collection.activeItem)
		if next = @collection.activeItem.next()
			@nextItemView = @createChildView(next, prev: @currentItemView)
		if prev = @collection.activeItem.prev()
			@prevItemView = @createChildView(prev, next: @currentItemView)
	scrollNext: ->
		@prevItemView.remove() if @prevItemView
		@currentItemView.layoutAsPrev()
		@prevItemView = @currentItemView
		@nextItemView.layoutAsCurrent()
		@currentItemView = @nextItemView
		if @nextItemView.model.next()
			@nextItemView = @createChildView(@nextItemView.model.next(), prev: @nextItemView)
		else
			@nextItemView = null
	scrollPrev: ->
		@nextItemView.remove() if @nextItemView
		@currentItemView.layoutAsNext()
		@nextItemView = @currentItemView
		@prevItemView.layoutAsCurrent()
		@currentItemView = @prevItemView
		if @prevItemView.model.prev()
			@prevItemView = @createChildView(@prevItemView.model.prev(), next: @prevItemView)
		else
			@prevItemView = null
	layout: =>
		@currentItemView.layoutAsCurrent()
		_.debounce (=> @nextItemView.layoutAsNext()), 200 if @nextItemView
		_.debounce (=> @prevItemView.layoutAsPrev()), 200 if @prevItemView
		
