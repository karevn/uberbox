class Uberbox.CarouselItem extends Uberbox.SlidingWindowItem
	template: -> Uberbox.Templates['carousel-item']
	className: 'uberbox-carousel-item'
	padding: 15
	ui:
		image: 'img'
		loader: '.uberbox-loader'
	getImageAspectRatio: ->
		image = @ui.image[0]
		aspect = image.naturalWidth / image.naturalHeight
	getHeightInVerticalMode: -> @width / @getImageAspectRatio()
	getWidthInHorizontalMode: -> @height * @getImageAspectRatio()

	bindUIElements: ->
		super
		if @ui.image[0].complete
			_.defer => @trigger('load')
		@$el.find('img').on 'load', => @trigger('load')
	layoutContent: ->
	hideLoader: -> @ui.loader.remove()
	layout: ->
		if @model.isActive()
			@calculateCoordinatesAsCurrent()
		else if @model.follows(@model.collection.activeItem)
			@calculateCoordinatesAsNext()
		else if @model.precedes(@model.collection.activeItem)
			@calculateCoordinatesAsPrev()
		@layoutContent() if @loaded
		@applyLayout()
		
	getNext: -> @getOption('next')
	getPrev: -> @getOption('prev')
	remove: ->
		@$el.find('img').off 'load', @onImageLoaded
		@$el.remove()
		if next = @getOption('next')
			next.options.prev = null
		if prev = @getOption('prev')
			prev.options.next = null
	fits: -> 
		return true if @belongs()
		return true if @top < @getParent().height() and @top + @$el.height() > 0 and
			@left + @$el.width() > 0 and @left < @getParent().width() and @top < @getParent().height()
		false
	
	applyLayout: -> @$el.css(left: @left, top: @top, width: @width, height: @height)

class Uberbox.VerticalCarouselItem extends Uberbox.CarouselItem
	calculateCoordinatesAsPrev: ->
		return unless next = @getOption('next')
		@left = @padding
		@width = @getParent().width() - @padding * 2
		@height = @getHeightInVerticalMode()
		@top = next.top - @padding - @height
	calculateCoordinatesAsNext: ->
		return unless prev = @getOption 'prev'
		@left = @padding
		@top =  @padding + prev.top  + prev.height
		@width = @getParent().width() - @padding * 2
		@height = @getHeightInVerticalMode()
	calculateCoordinatesAsCurrent: ->
		@width = @getParent().width() - @padding * 2
		@height = @getHeightInVerticalMode()
		top = @getParent().height() / 2 - @height / 2
		@left = @padding
		@top = top
	
class Uberbox.HorizontalCarouselItem extends Uberbox.CarouselItem
	calculateCoordinatesAsPrev: ->
		return unless next = @getOption('next')
		@height = @getParent().height() - @padding * 2
		@width = @getWidthInHorizontalMode()
		@left = next.left - @width - @padding
		@top = @padding
	calculateCoordinatesAsNext: ->
		return unless prev = @getOption 'prev' 
		@left = prev.left + prev.width + @padding
		@top = @padding
		@height = @getParent().height() - @padding * 2
		@width = @getWidthInHorizontalMode()
	calculateCoordinatesAsCurrent: ->
		@height = @getParent().height() - @padding * 2
		@width = @getWidthInHorizontalMode()
		@left = @getParent().width() / 2 - @width / 2
		@top = @padding
	
class Uberbox.Carousel extends Uberbox.SlidingWindow
	className: 'uberbox-carousel-content'
	template: -> Uberbox.Templates['carousel-content']
	render: -> @$el.html(Marionette.Renderer.render(@template))
	getChildViewClass: -> 
		if @getOption('orientation') == 'vertical'
			return Uberbox.VerticalCarouselItem
		else
			return Uberbox.HorizontalCarouselItem
	hide: ->
		return unless @currentItemView
		@currentItemView.remove()
		item = @currentItemView
		item.remove() while item = item.getOption('next')
		item = @currentItemView
		item.remove() while item = item.getOption('prev')
		@currentItemView = null
			
	build: (item)->
	
	buildNext: (last) =>
		if @belongs(last) and last.model.next() and !last.getNext()
			next = @createChildView(last.model.next(), prev: last)
			next.runAction =>
				next.layout()
				@buildNext(next)
	buildPrev: (first)=>
		if @belongs(first) and first.model.prev() and !first.getPrev()
			prev = @createChildView(first.model.prev(), next: first)
			prev.runAction =>
				prev.layout()
				@buildPrev(prev)
	waitForLast: (last, lastCallback)=>
		last.runAction =>
			if last.getNext()
				@waitForLast(last.getNext(), lastCallback)
			else
				lastCallback(last)
	waitForFirst: (first, firstCallback)=>
		first.runAction =>
			if first.getPrev()
				@waitForFirst(first.getPrev(), firstCallback)
			else
				firstCallback(first)
	isHorizontal: -> @getOption('orientation') == 'horizontal'
	fits: (item)->
		parent = @$el.parent()
		if @isHorizontal()
			width = parent.width()
			return @translateX + item.left + item.width > 0 and @translateX + item.left < width
		else
			height = parent.height()
			return @translateY + item.top + item.height > 0 and @translateY + item.top < height
	belongs: (item)->
		parent = @$el.parent()
		if @isHorizontal()
			width = parent.width()
			return @translateX + item.left + item.width < width and @translateX + item.left > 0
		else
			height = parent.height()
			return @translateY + item.top + item.height < height and @translateY + item.top > 0
	translateToCurrent: ->
		if @isHorizontal()
			offset = @currentItemView.left
			@translateX = @$el.parent().width() / 2 - offset - @currentItemView.$el.width() / 2
			@$el.css transform: "translate(#{@translateX}px, 0px)"
		else
			offset = @currentItemView.top
			@translateY = @$el.parent().height() / 2 - offset - @currentItemView.$el.height / 2
			@$el.css transform: "translate(0px, #{@translateY}px)"
	layout: =>
		if !@currentItemView
			@currentItemView = @createChildView(@collection.activeItem)
		@translateToCurrent()
		@currentItemView.runAction =>
			@waitForLast @currentItemView, (last)=>
				if !@fits(last)
					while !@fits(last)
						last.remove()
						last = last.getPrev()
				else
					@buildNext(last)
			@waitForFirst @currentItemView, (first)=>
				if !@fits(first)
					while !@fits(first)
						first.remove()
						first = first.getPrev()
				else
					@buildPrev(first)
				
			

	onItemActivated: (item)->
		return if @currentItemView and item == @currentItemView.model
		unless @currentItemView
			@currentItemView = @createChildView(item)
			@currentItemView.layout()
			@layout()
			return
		if next = @currentItemView.getNextToScrollTo(item)
			@currentItemView = next
			@layout()
		else if prev = @currentItemView.getPrevToScrollTo(item)
			@currentItemView = prev
			@layout()
		else
			@currentItemView.remove()
			next = @currentItemView.getOption('next')
			while next
				next.remove()
				next = next.getOption('next')
			prev = @currentItemView.getOption('prev')
			while prev
				prev.remove()
				prev = prev.getOption('prev')
			@currentItemView.layout()
			@currentItemView = @createChildView(item)
			@layout()
	
