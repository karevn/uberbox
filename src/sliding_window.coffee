class Uberbox.SlidingWindow extends Marionette.View
	constructor: (options)->
		super _.extend({current: 0}, options)
		@listenTo @collection, 'activate', @onItemActivated

	onShow: ->
		@collection.at(@getOption('current')).activate()
		jQuery(window).on 'resize', @onWindowResized
	onWindowResized: =>
		@currentItemView.layoutAsCurrent()
		item = @currentItemView.getOption('next')
		while item
			item.layoutAsNext()
			item = item.getOption('next')
		item = @currentItemView.getOption('prev')
		while item
			item.layoutAsPrev()
			item = item.getOption('prev')

	getChildView: (child)-> childView = @getOption('childView') || @constructor
	createChildView: (child, options = {})->
		viewClass = @getChildView(child)
		options = _.extend(_.extend({model: child, orientation: @getOption('orientation')},
				Marionette._getValue(@getOption('childViewOptions'), this, [child])), options
		)
		view = new viewClass(options)
		if options.prev
			view.$el.insertAfter(options.prev.$el)
		else if options.next
			view.$el.insertBefore(options.next.$el)
		else
			view.$el.appendTo(@$el)
		view.render()
		view

	buildFromScratch: (item)->
		@currentItemView = @createChildView(item)
		@currentItemView.layoutAsCurrent(true)
		@layoutNextItems(@currentItemView)
		@layoutPrevItems(@currentItemView)
	slideNext: ->
		@currentItemView = @currentItemView.getOption('next')
		@layout()
	slidePrev: ->
		@currentItemView = @currentItemView.getOption('prev')
		@layout()

	layout: ->
		@currentItemView.layoutAsCurrent()
		@layoutPrevItems(@currentItemView)
		@layoutNextItems(@currentItemView)

	layoutNextItems: (prev)->
		if prev != @currentItemView
			prev.layoutAsNext()
			unless prev.fits()
				prev.fadeOut()
		if prev.model.next() and !prev.getOption('next')
			view = @createChildView(prev.model.next(), prev: prev)
			prev.options.next = view
			view.options.prev = prev
			view.layoutAsNext(true)
			return @layoutNextItems(view)
		else
			if prev.getOption('next')
				return @layoutNextItems(prev.getOption('next'))
			else
				return null

	layoutPrevItems: (next)->
		if next != @currentItemView
			next.layoutAsPrev()
			next.fadeOut() unless next.fits()
		if next.model.prev() and next.fits() and !next.getOption('prev')
			view = @createChildView(next.model.prev(), next: next)
			next.options.prev = view
			view.options.next = next
			view.layoutAsPrev(true)
			return @layoutPrevItems(view)
		else
			if next.getOption('prev')
				return @layoutPrevItems(next.getOption('prev'))
			else
				return null
	onItemActivated: (item)->
		return if @currentItemView and item == @currentItemView.model
		unless @currentItemView
			@buildFromScratch(item)
			return
		if item.next() == @currentItemView.model
			@slidePrev()
		else if item.prev() == @currentItemView.model
			@slideNext()
		else
			@currentItemView.fadeOut()
			next = @currentItemView.getOption('next')
			while next
				next.fadeOut()
				next = next.getOption('next')
			prev = @currentItemView.getOption('prev')
			while prev
				prev.fadeOut()
				prev = prev.getOption('prev')
			#setTimeout((=> @buildFromScratch(item)), 200)
			@buildFromScratch(item)
