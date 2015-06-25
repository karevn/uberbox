class Uberbox.ToolbarView extends Marionette.ItemView
	template: -> Uberbox.Templates.toolbar
	getTemplate: -> @template()
	className: 'uberbox-toolbar'
	ui: 
		fullscreen: '*[data-action=fullscreen]'
		exitFullscreen: '*[data-action=exit-fullscreen]'
		close: '*[data-action=close]'
		share: '*[data-action=share]'
		shareMenu: '.uberbox-share-menu'
	events: 
		'click @ui.fullscreen': 'onFullscreenClick'
		'click @ui.exitFullscreen': 'onExitFullscreenClick'
		'click @ui.close': 'onCloseClick'
		'click @ui.share': 'onShareClick'
		'click .uberbox-share-overlay': 'onShareClick'
	
	initialize: ->
		super
		@render()
		@bindUIElements()
	reveal: =>
		@$el.addClass('uberbox-visible')
		@layout()
	serializeData: -> {model: @model}
	layout: ->
		if jQuery(window).width() > 639
			itemView = @getOption('bindTo')
			offset = itemView.getOffset()
			offset.left -= @$el.parent().offset().left
			offset.top -= 45
			@$el.width(itemView.getWidth()).css offset
		else
			@$el.css(left: '', top: 42)
	onFullscreenClick: (e)-> 
		e.preventDefault()
		e.stopPropagation()
		@ui.fullscreen.prop('disabled', true)
		@ui.exitFullscreen.prop('disabled', false)
		Uberbox.Utils.enterFullscreen(document.documentElement)
	onExitFullscreenClick: (e)->
		e.preventDefault()
		e.stopPropagation()
		@ui.exitFullscreen.prop('disabled', true)
		@ui.fullscreen.prop('disabled', false)
		Uberbox.Utils.exitFullscreen()
	onCloseClick: (e)-> 
		e.preventDefault()
		e.stopPropagation()
		@model.trigger 'close'
	onShareClick: (e)->
		unless @ui.share.hasClass('uberbox-active')
			@ui.share.append(jQuery('<div class="uberbox-share-overlay">'))
			@ui.share.addClass('uberbox-active')
			_.defer => 
				@ui.share.find('.uberbox-share-overlay').addClass('uberbox-active')
				@ui.shareMenu.addClass('uberbox-active')
		else
			@ui.share.find('.uberbox-share-overlay').removeClass('uberbox-active')
			@ui.shareMenu.removeClass('uberbox-active')
			setTimeout((=> 
				@ui.share.find('.uberbox-share-overlay').remove()
				@ui.share.removeClass('uberbox-active')
			), 300)

	remove: ->
		@stopListening()
		@$el.html('')
		this