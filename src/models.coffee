class Uberbox.ShareService extends Backbone.Model
	@services:
		facebook: 
			url: "//www.facebook.com/share.php?v=4&src=bm&u=%url%"
			name: 'Facebook'
		twitter:
			url: "//twitter.com/home?status=%url%"
			name: 'Twitter'
		googleplus:
			url: "//plus.google.com/share?url=%url%"
			name: 'Google Plus'
		reddit:
			url: "//reddit.com/submit?url=%url%"
			name: 'Reddit'
		digg:
			url: "//digg.com/submit?phase=2&url=%url%"
			name: 'Digg'
		stumbleupon: 
			url: "http://www.stumbleupon.com/submit?url=%url%&title=%title%"
			name: "Stumbleupon"
		delicious:
			url: "//delicious.com/post?url="
			name: 'Delicious'
		pinterest:
			url: "//www.pinterest.com/pin/create/button/?url=%url%&description=%title%"
			name: 'Pinterest'
		vk:
			url: "http://vk.com/share.php?url=%url%"
			name: 'VK'
	processPseudotags: (template)->
		tags = {
			url: window.location.href
			title: @get('title')
			description: @get('description')
		}
		template = template.replace("%#{tag}", encodeURIComponent(tags[tag])) for tag of tags
		template
	getShareLinkUrl: -> @processPseudotags(@get('url'))
	
class Uberbox.Item extends Backbone.Model
	defaults:
		description_style: 'mini'
		download_tooltip: 'Download'
		share_tooltip: 'Share'
		fullscreen_tooltip: 'Fullscreen'
		exit_fullscreen_tooltip: 'Exit fullscreen'
	
	initialize: ->
		super
		if share = @get('share')
			share = Uberbox.ShareService.services if _.isBoolean(share)
			@set 'share', _.map share, (config, name)->
				new Uberbox.ShareService(_.extend({}, {slug: name}, config))

	activate: -> @trigger('activate', this) unless @collection.activeItem == this
	deactivate: -> @trigger('deactivate')
	next: -> @collection.next(this)
	prev: -> @collection.prev(this)
	isActive: -> @collection.activeItem == this
	isNext: -> @collection.activeItem == @prev()
	isPrev: -> @collection.activeItem == @next()
	

class Uberbox.ItemCollection extends Backbone.Collection
	model: Uberbox.Item
	current: null
	initialize: ->
		super
		@on 'activate', (item)=>
			if @activeItem
				@activeItem.deactivate()
			@activeItem = item
	next: (item)->
		index = @indexOf(item)
		return null if index == @length - 1
		@at(index + 1)
	prev: (item)->
		index = @indexOf(item)
		return if index == 0
		@at(index - 1)
	activateNext: -> @current.next().activate() if @current and @current.next()
	activatePrev: -> @current.prev().activate() if @current and @current.prev()
