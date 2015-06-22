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
	remove: ->
		@$el.find('img').off 'load', @onImageLoaded
	fits: -> 
		return true if @belongs()
		offset = @$el.offset()
		return true if (@top < @getParent().height() and offset.top + @$el.height() > 0 and 
			offset.left - @$el.offsetParent().offset().left < @getParent().width() and offset.left - @$el.offsetParent().offset().left + @$el.width() > 0)
		false
	
	applyLayout: -> @$el.css(left: @left, top: @top, width: @width, height: @height)

class Uberbox.VerticalCarouselItem extends Uberbox.CarouselItem
	calculateCoordinatesAsPrev: ->
		next = @getOption('next')
		@left = @padding
		@width = @getParent().width() - @padding * 2
		@height = @getHeightInVerticalMode()
		@top = next.top - @padding - @height
	calculateCoordinatesAsNext: ->
		prev = @getOption 'prev'
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
		next = @getOption('next')
		@height = @getParent().height() - @padding * 2
		@width = @getWidthInHorizontalMode()
		@left = next.left - @width - @padding
		@top = @padding
	calculateCoordinatesAsNext: ->
		prev = @getOption 'prev' 
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
		@currentItemView = @createChildView(item)
		@currentItemView.runAction =>
			@buildNext(@currentItemView)
			@buildPrev(@currentItemView)
	buildNext: (item)=>
		if item.fits() and item.model.next() and !item.getOption('next')
			next = @createChildView(item.model.next(), prev: item)
			next.runAction => @buildNext(next)
	buildPrev: (item)=>
		if item.fits() and item.model.prev()  and !item.getOption('prev')
			prev = @createChildView(item.model.prev(), next: item)
			prev.runAction => @buildPrev(prev)
	layout: =>
		if !@$el.is(':visible')
			@hide()
		else
			if !@currentItemView
				@build(@collection.activeItem)
			else
				@currentItemView.layout()
				prev = next = @currentItemView
				while next = next.getOption('next')
					next.layout()
					@buildNext(next)
				while prev = prev.getOption('prev')
					prev.layout()
					@buildPrev(prev)
					

	onItemActivated: (item)->
		return if @currentItemView and item == @currentItemView.model
		unless @currentItemView
			@build(item)
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
			@build(item)
	
