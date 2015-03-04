class Uberbox.Item extends Backbone.Model
	activate: ->
		@collection.activeItem = this
		@trigger('activate', this)
	next: -> @collection.next(this)
	prev: -> @collection.prev(this)

class Uberbox.ItemCollection extends Backbone.Collection
	model: Uberbox.Item
	current: null
	initialize: ->
		super
		@on 'activate', (item)=>
			@current = item
	next: (item)->
		index = @indexOf(item)
		return null if index == @length - 1
		@at(index + 1)
	prev: (item)->
		index = @indexOf(item)
		return if index == 0
		@at(index - 1)
	activateNext: -> @current.next().activate() if @current and @current.next()
	activatePrev: -> @current.prev().activate() if @current and @current.prev()
