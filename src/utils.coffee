class Uberbox.Utils
	@supportsFullScreen: ->
		el = document.documentElement
		return true if el.requestFullscreen
		for prefix in ['moz', 'webkit', 'ms']
			return true if el["#{prefix}RequestFullScreen"]
		false
	@isFullscreen: ->
		for method in ['fullscreenEnabled', 'webkitFullscreenEnabled', 'mozFullscreenEnabled', 'msFullscreenEnabled']
			if !_.isUndefined(document[method])
				return document[method]
		
	@enterFullscreen: (el)->
		el = document.documentElement unless el
		method = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen
		method.apply(el)
	@exitFullscreen: ->
		el = document.documentElement
		method = el.exitFullscreen || el.mozCancelFullScreen || el.msExitFullscreen
		method.apply(el) if method 
		if document.webkitExitFullscreen
			document.webkitExitFullscreen()
