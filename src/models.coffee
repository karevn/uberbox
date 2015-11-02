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
			url: "//delicious.com/post?url=%url%"
			name: 'Delicious'
		pinterest:
			url: "https://www.pinterest.com/pin/create/button/?url=%url%&media=%image_url%&description=%description%&title=%title%"
			name: 'Pinterest'
		vk:
			url: "http://vk.com/share.php?url=%url%"
			name: 'VK'
	processPseudotags: (template, model)->
		tags = {
			url: window.location.href
			image_url: model.get('url')
			title: model.get('title') || ''
			description: model.get('description') || ''
		}
		for tag of tags
			template = template.replace("%#{tag}%", encodeURIComponent(tags[tag]))

		template
	getShareLinkUrl: (model)-> @processPseudotags(@get('url'), model)

class Uberbox.Item extends Backbone.Model
	defaults:
		description_style: 'mini'
		download_tooltip: 'Download'
		download_started_tooltip: 'Download started'
		share_tooltip: 'Share'
		fullscreen_tooltip: 'Fullscreen'
		exit_fullscreen_tooltip: 'Exit fullscreen'

	initialize: ->
		super
		if share = @get('share')
			share = Uberbox.ShareService.services if _.isBoolean(share)
			@set 'share', _.map share, (config, name)->
				new Uberbox.ShareService(_.extend({}, {slug: name}, config))
		if !@get('title') and !@get('description')
			@set('description_style', 'none')
	activate: -> @trigger('activate', this) unless @collection.activeItem == this
	deactivate: -> @trigger('deactivate')
	next: -> @collection.next(this)
	prev: -> @collection.prev(this)
	isActive: -> @collection.activeItem == this
	isNext: -> @collection.activeItem == @prev()
	isPrev: -> @collection.activeItem == @next()
	showDescription: ->
		return false if @get('description_style') == 'none'
		return !!@get('description')
	follows: (item)->
		next = item.next()
		return true if next == this
		return @follows(next) if next
		false
	precedes: (item)->
		prev = item.prev()
		return true if prev == this
		return @precedes(prev) if prev
		false

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
	activateNext: -> @activeItem.next().activate() if @activeItem and @activeItem.next()
	activatePrev: -> @activeItem.prev().activate() if @activeItem and @activeItem.prev()
