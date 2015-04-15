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
			@$el.addClass 'uberbox-loaded'
			clearTimeout(@loaderTimeout) if @loaderTimeout
			@hideLoader()
		@render()
		@bindUIElements()
		@showRegions() if @showRegions
	getTemplate: -> @getOption('template')()
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
			@loaderTimeout = setTimeout @showLoader, 200
			@listenToOnce this, 'load', => setTimeout(callback, 200)
	getParent: ->
		@parent = @$el.parent() unless @parent
		@parent
	remove: ->
		@$el.removeClass 'uberbox-visible'
		if @getOption('next')
			@getOption('next').options.prev = null
		if @getOption('prev')
			@getOption('prev').options.next = null
		setTimeout((=>super()), 600)
	reveal: -> _.defer => @$el.addClass('uberbox-visible')
	bindUIElements: ->
		super
		@onItemActivated() if @model.collection.activeItem == @model
	onItemActivated: -> @$el.addClass('uberbox-current')
	onItemDeactivated: -> @$el.removeClass('uberbox-current')
	onClicked: => @model.activate()
	

	
		
		

	
		
		