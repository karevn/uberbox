class Uberbox.ToolbarView extends Marionette.ItemView
	template: -> Uberbox.Templates.toolbar
	getTemplate: -> @template()
	className: 'uberbox-toolbar'
	ui:
		download: '*[data-action=download]'
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
		'click @ui.download': 'onDownloadClick'
		'click .uberbox-share-overlay': 'onShareClick'
	serializeData: -> {model: @model}
	onShow: ->
		_.defer => @$el.addClass('uberbox-visible')
	onFullscreenClick: (e)->
		e.preventDefault()
		e.stopPropagation()
		@ui.fullscreen.addClass 'uberbox-disabled'
		@ui.exitFullscreen.removeClass 'uberbox-disabled'
		Uberbox.Utils.enterFullscreen(document.documentElement)
	onDownloadClick: (e)->
		Uberbox.Utils.notification(message: @model.get('download_started_tooltip'))
	onExitFullscreenClick: (e)->
		e.preventDefault()
		e.stopPropagation()
		@ui.exitFullscreen.addClass 'uberbox-disabled'
		@ui.fullscreen.removeClass 'uberbox-disabled'
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


