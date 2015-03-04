class Uberbox.CarouselItem extends Uberbox.SlidingWindowItem
	template:'#uberbox-template-carousel-item'
	className: 'uberbox-carousel-item'
	padding: 15
	getCurrentVerticalHeight: -> 120
	getCurrentHorizontalWidth: -> 120
	getVerticalHeight: -> 120
	getHorizontalWidth: -> 120

class Uberbox.Carousel extends Uberbox.SlidingWindow
	template: '#uberbox-template-carousel'
	className: 'uberbox-carousel-content'
	childView: Uberbox.CarouselItem
