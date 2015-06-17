class Uberbox.SlidingWindow extends Marionette.View
	defaults: -> 
		orientation: 'vertical'
		current: 0
	constructor: (options)->
		super _.extend({}, _.result(this, 'defaults'), options)
		@listenTo @collection, 'activate', @onItemActivated
	onShow: -> jQuery(window).on 'resize.uberbox', @layout
	remove: ->
		jQuery(window).off 'resize.uberbox'
		super
	getChildView: (child)-> childView = @getOption('childView') || @constructor
	createChildView: (child, options = {})->
		viewClass = @getChildViewClass()
		options = _.extend(_.extend({model: child, orientation: @getOption('orientation')},
			Marionette._getValue(@getOption('childViewOptions'), this, [child])), options
		)
		view = new viewClass(options)
		if options.prev and !options.next
			view.$el.insertAfter(options.prev.$el)
			view.layoutAsNext()
		else if options.next and !options.prev
			view.$el.insertBefore(options.next.$el)
			view.layoutAsPrev()
		else
			view.$el.appendTo(@$el)
			if options.fromPrev
				view.layoutAsPrev()
			else if options.fromNext
				view.layoutAsNext()
			else
				view.layoutAsCurrent()
		view
