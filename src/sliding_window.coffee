class Uberbox.SlidingWindow extends Marionette.View
	defaults: -> 
		orientation: 'vertical'
		current: 0
	constructor: (options)->
		super _.extend({}, _.result(this, 'defaults'), options)
		@listenTo @collection, 'activate', @onItemActivated
	onShow: -> jQuery(window).on 'resize', @layout
	remove: ->
		jQuery(window).off 'resize', @layout
		super
	getChildView: (child)-> childView = @getOption('childView')
	createChildView: (child, options = {})->
		viewClass = @getChildViewClass()
		options = _.extend(_.extend({model: child, orientation: @getOption('orientation')},
			Marionette._getValue(@getOption('childViewOptions'), this, [child])), options
		)
		view = new viewClass(options)
		if options.prev and !options.next
			options.prev.options.next = view
			view.$el.insertAfter(options.prev.$el)
		else if options.next and !options.prev
			options.next.options.prev = view
			view.$el.insertBefore(options.next.$el)
		else
			view.$el.appendTo(@$el)
		view
