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
			_.defer => @onImageLoaded()
		@$el.find('img').on 'load', @onImageLoaded
	onImageLoaded: => 
		@trigger('load')
	layoutContent: ->
	hideLoader: ->
		@ui.loader.remove()
	layoutAsCurrent: ->
		@calculateCoordinatesAsCurrent()
		@layoutContent() if @loaded
		@applyLayout()
	layoutAsNext: ->
		@calculateCoordinatesAsNext()
		@layoutContent() if @loaded
		@applyLayout()
	layoutAsPrev: ->
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
			
	buildFromScratch: (item)->
		@currentItemView = @createChildView(item)
		@currentItemView.layoutAsCurrent()
		@currentItemView.runAction =>
			@currentItemView.layoutAsCurrent()
			@currentItemView.reveal()
			@layoutNextItems(@currentItemView)
			@layoutPrevItems(@currentItemView)
	slideTo: (item)->
		@currentItemView.runAction =>
			@currentItemView = item
			@layout()
	layout: =>
		if !@$el.is(':visible')
			@hide()
		else
			unless @currentItemView
				@buildFromScratch(@collection.activeItem)
				return
			@currentItemView.layoutAsCurrent()
			@currentItemView.runAction =>
				@layoutPrevItems(@currentItemView)
				@layoutNextItems(@currentItemView)

	layoutNextItems: (prev)->
		if prev != @currentItemView
			prev.layoutAsNext()
			unless prev.fits()
				prev.remove()
				return null
		if prev.model.next() and !prev.getOption('next') and prev.fits()
			view = @createChildView(prev.model.next(), prev: prev)
			prev.options.next = view
			view.options.prev = prev
			view.layoutAsNext()
			view.reveal()
			view.runAction => @layoutNextItems(view)
		else if prev.getOption('next')
			@layoutNextItems(prev.getOption('next'))

	layoutPrevItems: (next)->
		if next != @currentItemView
			next.layoutAsPrev()
			unless next.fits()
				next.remove()
				return null
		if next.model.prev()  and !next.getOption('prev') and next.fits()
			view = @createChildView(next.model.prev(), next: next)
			next.options.prev = view
			view.options.next = next
			view.layoutAsPrev()
			view.reveal()
			view.runAction => @layoutPrevItems(view)
		else if next.getOption('prev')
			@layoutPrevItems(next.getOption('prev'))

	onItemActivated: (item)->
		return if @currentItemView and item == @currentItemView.model
		unless @currentItemView
			@buildFromScratch(item)
			return
		if next = @currentItemView.getNextToScrollTo(item)
			@slideTo(next)
		else if prev = @currentItemView.getPrevToScrollTo(item)
			@slideTo(prev)
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
			#setTimeout((=> @buildFromScratch(item)), 200)
			@buildFromScratch(item)
	
