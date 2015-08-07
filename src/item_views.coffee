
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
	onObjectError: => @trigger 'error'
	onObjectLoaded: => @trigger('load')
	serializeData: -> model: @model
	getOffset: -> 
		offset = @$el.offset()
		offset.top -= jQuery(window).scrollTop()
		offset
		
	

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
	getOffset: -> 
		offset = @ui.image.offset()
		return {
			left: offset.left
			top: offset.top - jQuery(window).scrollTop()
		}
	getWidth: -> @ui.image.width()
	
	
class Uberbox.IframeObjectView extends ObjectView
	waitForLoad: true
	supportsOversizing: false
	className: 'uberbox-iframe-content'
	ui:
		iframe: 'iframe'
	template: -> Uberbox.Templates['content-iframe']
	bindUIElements: ->
		super
		@ui.iframe.one 'load.uberbox', @onObjectLoaded
		@onObjectLoaded() if @isObjectLoaded()
		jQuery(window).on 'resize.uberbox', @onWindowResized
		_.defer => @onWindowResized()
	unbindUIElements: ->
		@ui.iframe.off 'load.uberbox'
		jQuery(window).off 'resize.uberbox'
	getObjectWidth: -> @ui.iframe.width()
	isObjectLoaded: -> @ui.iframe[0].complete
	serializeData: -> _.extend(super, url: @getIframeUrl())
	onWindowResized: => 
		@ui.iframe.height(Math.min(@ui.iframe.width() / @getObjectNaturalAspectRatio(), @$el.height()))
	getIframeUrl: -> @model.get('url')
	getObjectNaturalWidth: -> @$el.parent().width()
	getObjectNaturalHeight: -> @$el.parent().height()
	
class Uberbox.YoutubeObjectView extends Uberbox.IframeObjectView
	className: 'uberbox-iframe-content uberbox-youtube-content'
	getIframeUrl: -> "//www.youtube.com/embed/#{@getVideoID()}"
	getVideoID: ->
		url = @model.get('url')
		if url.match(regex = /.*(\(\/\/)?(www\.)?youtube\.com\/watch\?v=/i)
			return url.replace(regex, '')
		else
			return url.replace(/.*(\/\/)(www\.)?youtu\.be\/.*/i, '')
	getObjectNaturalAspectRatio: -> 16.0 / 9.0
	
class Uberbox.VimeoObjectView extends Uberbox.IframeObjectView
	className: 'uberbox-iframe-content uberbox-vimeo-content'
	getIframeUrl: -> "//player.vimeo.com/video/#{@getVideoID()}"
	getVideoID: -> @model.get('url').replace(/(https?:)?(\/\/)?vimeo\.com\//i, '')
	getObjectNaturalAspectRatio: -> 16.0 / 9.0

class Uberbox.GoogleMapsObjectView extends Uberbox.IframeObjectView
	className: 'uberbox-iframe-content uberbox-gmap-content'
	getIframeUrl: -> "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d17445.16630767115!2d60.755398270861825!3d56.86916950021604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sru!4v1429115765389" 
	getObjectNaturalAspectRatio: -> @$el.parent().width() / @$el.parent().height()
	
class Uberbox.SoundcloudObjectView extends Uberbox.IframeObjectView
	className: 'uberbox-iframe-content uberbox-soundcloud-content'
	getIframeUrl: ->"//w.soundcloud.com/player/?url=" + encodeURIComponent(@model.get('url')) 
	
class Uberbox.BandcampObjectView extends Uberbox.IframeObjectView
	className: 'uberbox-iframe-content uberbox-bandcamp-content'
	getIframeUrl: -> @model.get('url')
		
class Uberbox.HTMLObjectView extends ObjectView
	className: 'uberbox-html-content'
	waitForLoad: false
	template: -> Uberbox.Templates['content-html']
	getObjectNaturalWidth: -> 650
	getObjectNaturalHeight: -> 400
class Uberbox.AJAXOBjectView extends ObjectView
	className: 'uberbox-ajax-content'
	waitForLoad: true
	template: -> Uberbox.Templates['content-html']
	bindUIElements: ->
		super
		jQuery.get(@model.get('url'), (response)=>
			@$el.html(response)
			@trigger('load')
			@layout()
		)
		jQuery(window).on 'resize', @layout

	layout: =>
		if @$el.height() < @$el.parent().height()
			@$el.addClass('uberbox-center-vertical')
		else
			@$el.addClass('uberbox-scroll').removeClass('uberbox-center-vertical')
class Uberbox.UnknownItemView extends ObjectView
	className: 'uberbox-unknown-content'
	template: -> Uberbox.Templates['content-unknown']
	waitForLoad: false
	showContent: ->
	getObjectNaturalWidth: -> @$el.parent().width()
	getObjectNaturalHeight: -> @$el.parent().height()

