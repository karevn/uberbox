class Uberbox.Lightbox extends Uberbox.SlidingWindow
	className: 'uberbox-lightbox-content'
	template: -> Uberbox.Templates['lightbox-content']
	ui:
		next: '.uberbox-next'
		prev: '.uberbox-prev'
	events:
		'click @ui.next': (-> @currentItemView.model.next().activate() unless @ui.next.is('.uberbox-disabled'))
		'click @ui.prev': (-> @currentItemView.model.prev().activate() unless @ui.prev.is('.uberbox-disabled'))
	
	getChildViewClass: -> Uberbox.LightboxItem
	onShow: ->
		super
		@render()
		@bindUIElements()
	render: -> @$el.html(Marionette.Renderer.render(@template))

	onItemActivated: (item)->
		if !@currentItemView
			@currentItemView = @createChildView(item)
			if item.next()
				@nextItemView = @createChildView(item.next(), prev: @currentItemView)
			if item.prev()
				@prevItemView = @createChildView(item.prev(), prev: @currentItemView)
		else
			if item.follows(@currentItemView.model)
				@scrollNext(item)
			else
				@scrollPrev(item)
		if @currentItemView.model.next()
			@ui.next.removeClass('uberbox-disabled')
		else
			@ui.next.addClass('uberbox-disabled')
		if @currentItemView.model.prev()
			@ui.prev.removeClass('uberbox-disabled')
		else
			@ui.prev.addClass('uberbox-disabled')
	checkPrevNext: ->
	scrollNext: (item)->
		@prevItemView.remove() if @prevItemView
		if @currentItemView.model.isPrev(item)
			@prevItemView = @currentItemView
			@prevItemView.layout()
			@currentItemView = @nextItemView
			@currentItemView.layout()
			@currentItemView = @nextItemView
			if @currentItemView.model.next()
				@nextItemView = @createChildView(@currentItemView.model.next(), prev: @currentItemView)
			else
				@nextItemView = null
		else
			@nextItemView.remove() if @nextItemView
			previousCurrent = @currentItemView
			previousCurrent.layout()
			setTimeout((=> previousCurrent.remove()), 500)
			current = @currentItemView = @createChildView(item)
			@prevItemView = @createChildView(item.prev(), next: @currentItemView) if item.prev()
			@nextItemView = @createChildView(item.next(), prev: @currentItemView) if item.next()
			
			
	scrollPrev: (item)->
		@nextItemView.remove() if @nextItemView
		if @currentItemView.model.isNext(item)
			@nextItemView = @currentItemView
			@nextItemView.layout()
			@currentItemView = @prevItemView
			@currentItemView.layout()
			@currentItemView = @prevItemView
			if @currentItemView.model.prev()
				@prevItemView = @createChildView(@currentItemView.model.prev(), next: @currentItemView)
			else
				@prevItemView = null
		else
			@prevItemView.remove() if @prevItemView
			previousCurrent = @currentItemView
			previousCurrent.layout()
			setTimeout((=> previousCurrent.remove()), 500)
			current = @currentItemView = @createChildView(item)
			@nextItemView = @createChildView(item.next(), prev: @currentItemView) if item.next()
			@prevItemView = @createChildView(item.prev(), next: @currentItemView) if item.prev()
			
			
	layout: => 
		return unless @$el.is(':visible')
		@currentItemView.layout()
		_.defer =>
			@nextItemView.layout() if @nextItemView
			@prevItemView.layout() if @prevItemView
		
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
		content: '> .uberbox-lightbox-item-content-wrapper'
		description: '.uberbox-item-description'
	padding: 20
	initialize: ->
		super
		@once 'load', => @model.set('loaded', true)
	serializeData: -> {model: @model}
	layoutContent: =>
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
		if @model.get('description_style') == 'mini'
			return @object.currentView.getOffset()
		offset = @ui.content.offset()
		offset.top -= jQuery(window).scrollTop()
		offset
	getWidth: ->
		return @object.currentView.$el.width() if @model.get('description_style') == 'bottom'
		return @object.currentView.getWidth() if @model.get('description_style') == 'mini'
		@ui.content.width()
	swipeVertically: (amount)->  @$el.css(transform: "translate(0, #{amount}px)")
	swipeHorizontally: (amount)-> @$el.css(transform: "translate(#{amount}px, 0)")
	swipeBack: -> @$el.css(transform: "translate(0, 0)")
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
			#availableRatio = item.width() / (item.height() - if @description.currentView then @description.$el.outerHeight() else 0)
			availableRatio = objectView.$el.width() / objectView.$el.height()
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
		if jQuery(window).width() < 1024
			containerHeight = @$('.uberbox-item-object > *').height()
			contentHeight = (content = @$('.uberbox-item-object > * > *')).height()
			if  containerHeight < contentHeight
				content.css('margin-top', - (contentHeight - containerHeight) / 2)
		else
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
	showRegions: ->
		type = Uberbox.getObjectViewType(@model)
		if @model.get('description') and @model.get('description_style') != 'none'
			@$el.addClass('uberbox-has-description')
			@$el.addClass("uberbox-description-#{@model.get('description_style')}")
		else
			@$el.addClass('uberbox-no-description')
		@object.show(new type(_.extend(@options, model: @model)))
		if @object.currentView.waitForLoad
			@listenToOnce @object.currentView, 'load', => @trigger 'load'
		else
			@trigger 'load'
			@showContent()
	layout: ->
		if @isCurrent()
			@positionAsCurrent()
		else if @isNext()
			@positionAsNext()
		else if @isPrev()
			@positionAsPrev()
		else
			setTimeout(@remove, 400)
			return
		@layoutContent()
	isVertical: -> @getOption('orientation') == 'vertical'
	positionAsCurrent: -> @$el.css transform: ''

	positionAsNext: ->
		if @isVertical()
			@$el.css transform: "translate(0, #{jQuery(window).height()}px)"
		else
			@$el.css transform: "translate(#{jQuery(window).width()}px, 0)"
	positionAsPrev: ->
		if @isVertical()
			@$el.css transform: "translate(0, -#{jQuery(window).height()}px)"
		else
			@$el.css transform: "translate(-#{jQuery(window).width()}px, 0)"
	remove: =>
		if @model.isNext()
			@$el.addClass('uberbox-flyout-next')
		if @model.isPrev()
			@$el.addClass('uberbox-flyout-prev')
		if @getOption('next')
			@getOption('next').options.prev = null
		if @getOption('prev')
			@getOption('prev').options.next = null
		setTimeout((=>super()), 600)
	