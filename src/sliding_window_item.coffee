class Uberbox.SlidingWindowItem extends Marionette.ItemView
	events:
		click: 'onClicked'
	belongs: -> @top > 0 and @left > 0 and @width + @left < @$el.parent().width() and @top + @height < @$el.parent().height()

	fits: ->
		return true if @belongs()
		return true if @top < @$el.parent().height() and @top + @height > 0 and @left < @$el.parent().width() and @left + @width > 0
		false
	fadeOut: ->
		@$el.removeClass('uberbox-visible')
		if @getOption('next')
			@getOption('next').options.prev = null
		if @getOption('prev')
			@getOption('prev').options.next = null
		setTimeout((=>@remove()), 600)
	fadeIn: ->
		@$el.addClass('uberbox-visible')
		setTimeout((=> @$el.addClass('uberbox-enable-transition')), 300)
	flyOutPrev: ->
		@$el.addClass('uberbox-fled-prev').removeClass('uberbox-visible')
		setTimeout((=>@remove()), 600)
	flyOutNext: ->
		@$el.addClass('uberbox-fled-next').removeClass('uberbox-visible')
		setTimeout((=>@remove()), 600)

	layoutAsCurrent: ->
		if @getOrientation() == 'vertical'
			top = @$el.parent().height() / 2 - @getCurrentVerticalHeight() / 2
			@left = @padding
			@top = top
			@height = @getCurrentVerticalHeight()
			@width = @$el.parent().width() - @padding * 2
		else
			@left = @$el.parent().width() / 2 - @getCurrentHorizontalWidth() / 2
			@top = @padding
			@width = @getCurrentHorizontalWidth()
			@height = @$el.parent().height() - @padding * 2
		@applyRect()
	applyRect: -> @$el.css(left: @left, top: @top, width: @width, height: @height)
	layoutAsNext: ->
		prev = @getOption('prev')
		if @getOrientation() == 'vertical'
			@left = @padding
			@top =  @padding + prev.top  + prev.height
			@height = @getVerticalHeight(prev)
			@width = @$el.parent().width() - @padding * 2
		else
			@left = prev.left + prev.width + @padding
			@top = @padding
			@width = @getHorizontalWidth(prev)
			@height = @$el.parent().height() - @padding * 2
		@applyRect()
	layoutAsPrev: ->
		next = @getOption('next')
		if @getOrientation() == 'vertical'
			@left = @padding
			@top = next.top - @padding - @getVerticalHeight(next)
			@height = @getVerticalHeight(next)
			@width = @$el.parent().width() - @padding * 2
		else
			@left = next.left - @getHorizontalWidth(next) - @padding
			@top = @padding
			@width = @getHorizontalWidth(next)
			@height = @$el.parent().height() - @padding * 2
		@applyRect()



	getOrientation: -> @getOption('orientation')

	onClicked: => @model.activate()



