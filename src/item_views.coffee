
class ObjectView extends Marionette.ItemView
	supportsOversizing: false
	fadeIn: =>
		@visible = true
		@$el.addClass('uberbox-visible')
	getAspectRatio: -> @$el.width() / @$el.height()
	isObjectLoaded: ->
	getObjectNaturalAspectRatio: ->
	layoutOversized: ->
	getTemplate: -> @getOption('template')()
	getWidth: -> @$el.width()
	getObjectNaturalAspectRatio: -> @getObjectNaturalWidth() / @getObjectNaturalHeight()
	onObjectError: -> @trigger 'error'
	onObjectLoaded: => @trigger 'load'
	
	serializeData: -> {model: @model}

class Uberbox.ImageObjectView extends ObjectView
	className: 'uberbox-image-content'
	waitForLoad: true
	supportsOversizing: true
	template: -> Uberbox.Templates['content-image']
	ui:
		image: 'img'
	bindUIElements: ->
		super
		@onObjectLoaded() if @isObjectLoaded()
		@ui.image.one 'load.uberbox', @onObjectLoaded
		@ui.image.one 'error.uberbox', @onObjectError
	
	unbindUIElements: ->
		@ui.image.off 'load.uberbox'
		@ui.image.off 'error.uberbox'
		super
	
	getObjectWidth: -> @ui.image.width()
	isObjectLoaded: -> @ui.image[0].complete
	getObjectNaturalWidth: -> @ui.image[0].naturalWidth
	getObjectNaturalHeight: -> @ui.image[0].naturalHeight
	
	
	
class Uberbox.IframeObjectView extends ObjectView
	waitForLoad: true
	supportsOversizing: false
	ui:
		iframe: 'iframe'
	bindUIElements: ->
		super
		@ui.iframe.one 'load.uberbox', @onObjectLoaded
		@onObjectLoaded() if @isObjectLoaded()
	unbindUIElements: ->
		@ui.iframe.off 'load.uberbox'
	getObjectWidth: -> @ui.iframe.width()
	isObjectLoaded: -> @ui.iframe[0].complete
	
	serializeData: -> _.extend(super, url: @getIframeUrl())
	
class Uberbox.YoutubeObjectView extends Uberbox.IframeObjectView
	className: 'uberbox-iframe-content uberbox-youtube-content'
	template: -> Uberbox.Templates['content-youtube']
	getIframeUrl: -> "//www.youtube.com/embed/#{@getVideoID()}"
	getVideoID: ->
		url = @model.get('url')
		if url.match(regex = /.*(\(\/\/)?(www\.)?youtube\.com\/watch\?v=/i)
			return url.replace(regex, '')
		else
			return url.replace(/.*(\/\/)(www\.)?youtu\.be\/.*/i, '')
	
class Uberbox.VimeoObjectView extends Uberbox.IframeObjectView
	className: 'uberbox-iframe-content uberbox-vimeo-content'
	template: -> Uberbox.Templates['content-vimeo']

	

