class Uberbox.SlidingWindowItem extends Marionette.LayoutView
	loaded: false
	events: ->
		click: 'onClicked'
	modelEvents:
		activate: 'onItemActivated'
		deactivate: 'onItemDeactivated'
	belongs: -> 
		@top > 0 and @left > 0 and @width + @left < @getParent().width() and @top + @height < @getParent().height()
	initialize: ->
		super
		@listenToOnce this, 'load', => 
			@loaded = true
			@model.trigger 'load'
			@layout()
			_.defer =>
				@enableTransition()
				@$el.addClass 'uberbox-loaded'
		@render()
		@bindUIElements()
		@showRegions() if @showRegions
	getTemplate: -> @getOption('template')()
	enableTransition: => @$el.addClass('uberbox-enable-transition')
	getNextToScrollTo: (item)->
		return this if @model == item
		return next.getNextToScrollTo(item) if next = @getOption('next')
		null
	getPrevToScrollTo: (item)->
		return this if @model == item
		return next.getPrevToScrollTo(item) if next = @getOption('prev')
		null
	runAction: (callback)->
		if @loaded
			callback()
		else
			@listenToOnce this, 'load', => callback()
	getParent: ->
		@parent = @$el.parent() unless @parent
		@parent
	isNext: -> @model.follows(@model.collection.activeItem)
	isPrev: -> @model.precedes(@model.collection.activeItem)
	isCurrent: -> @model.isActive()
	remove: ->
		@$el.removeClass 'uberbox-visible'
		if @getOption('next')
			@getOption('next').options.prev = null
		if @getOption('prev')
			@getOption('prev').options.next = null
		setTimeout((=>super()), 600)
	reveal: -> 
	bindUIElements: ->
		super
		@onItemActivated() if @model.collection.activeItem == @model
	onItemActivated: -> @$el.addClass('uberbox-current')
	onItemDeactivated: -> @$el.removeClass('uberbox-current')
	onClicked: => @model.activate()
