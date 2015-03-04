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
		unless @$el.hasClass('uberbox-visible')
			@applyLayout()
			@fadeIn()
			_.defer =>

				_.defer =>
					@$el.addClass('uberbox-enable-transition')

		else
			@applyLayout()

	applyLayout: ->
		_.defer => @$el.css(left: @left, top: @top, width: @width, height: @height)
	layoutAsNext: ->
		prev = @getOption('prev')
		if @getOrientation() == 'vertical'
			@left = @padding
			@top =  @padding + prev.top  + prev.height
			@height = @getVerticalHeight(prev)
			@width = @$el.parent().width() - @padding * 2
			unless @$el.hasClass('uberbox-visible')
				@applyLayout()
				if @belongs()
					@fadeIn()
				else
					@$el.css('top', @top + @height)
					_.defer =>
						@$el.addClass('uberbox-enable-transition')
						@fadeIn()
			else
				@applyLayout()
		else
			@left = prev.left + prev.width + @padding
			@top = @padding
			@width = @getHorizontalWidth(prev)
			@height = @$el.parent().height() - @padding * 2
			unless @$el.hasClass('uberbox-visible')
				@applyLayout()
				if @belongs()
					@fadeIn()
				else
					@$el.css('left', @left + @width)
					_.defer =>
						@$el.addClass('uberbox-enable-transition')
						@fadeIn()
			else
				@applyLayout()

	layoutAsPrev: ->
		next = @getOption('next')
		if @getOrientation() == 'vertical'
			@left = @padding
			@top = next.top - @padding - @getVerticalHeight(next)
			@height = @getVerticalHeight(next)
			@width = @$el.parent().width() - @padding * 2
			unless @$el.hasClass('uberbox-visible')
				@applyLayout()
				if @belongs()
					@fadeIn()
				else
					@$el.css('top', @top - @height)
					_.defer =>
						@$el.addClass('uberbox-enable-transition')
						@fadeIn()
			else
				@applyLayout()
		else
			@left = next.left - @getHorizontalWidth(next) - @padding
			@top = @padding
			@width = @getHorizontalWidth(next)
			@height = @$el.parent().height() - @padding * 2
			unless @$el.hasClass('uberbox-visible')
				@applyLayout()
				if @belongs()
					@fadeIn()
				else
					@$el.css('left', @left - @width)
					_.defer =>
						@$el.addClass('uberbox-enable-transition')
						@fadeIn()
			else
				@applyLayout()



	getOrientation: -> @getOption('orientation')

	onClicked: => @model.activate()



