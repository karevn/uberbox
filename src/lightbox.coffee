class Uberbox.LightboxItem extends Uberbox.SlidingWindowItem
	template:'#uberbox-template-lightbox-item'
	className: 'uberbox-lightbox-item'
	padding: 40

	getCurrentVerticalHeight: -> @$el.parent().height() - @padding * 6
	getCurrentHorizontalWidth: -> @$el.parent().width() - @padding * 6
	getVerticalHeight: -> @$el.parent().height() - @padding * 12
	getHorizontalWidth: -> @$el.parent().width() - @padding * 12

class Uberbox.Lightbox extends Uberbox.SlidingWindow
	template: '#uberbox-template-lightbox'
	className: 'uberbox-lightbox-content'
	childView: Uberbox.LightboxItem
