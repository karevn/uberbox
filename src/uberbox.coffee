class Uberbox extends Marionette.LayoutView
  @instances = []
  template: -> Uberbox.Templates.uberbox
  regions:
    lightbox: '.uberbox-lightbox-wrapper'
    carousel: '.uberbox-carousel-wrapper'
    toolbar:  '.uberbox-toolbar-wrapper'
  ui:{}

  onTouchCancel: (e)-> e.preventDefault()
  isAndroid: -> navigator.userAgent.toLowerCase().indexOf('android') != -1
  onTouchStart: (e)=>
    if jQuery(e.target).closest('.uberbox-toolbar-wrapper, .uberbox-prev,
      .uberbox-next').length > 0
      return
    e.preventDefault()
    @touchStartedAt = {
      pageX: e.touches[0].pageX
      pageY: e.touches[0].pageY
    }
  onTouchMove: (e)=>
    return unless @touchStartedAt
    e.preventDefault()
    threshold = 5
    original = e.touches[0]
    diffX = original.pageX - @touchStartedAt.pageX
    diffY = original.pageY - @touchStartedAt.pageX
    if @getOption('orientation') == 'horizontal' and Math.abs(diffX) > threshold
      @lightbox.currentView.currentItemView.swipeHorizontally(if diffX > 0 then diffX - threshold else diffX + threshold)
      e.preventDefault()
    else if @getOption('orientation') == 'vertical' and Math.abs(diffY) > threshold
      @lightbox.currentView.currentItemView.swipeVertically(if diffY > 0 then diffY - threshold else diffY + threshold)
      e.preventDefault()
    else
      @lightbox.currentView.currentItemView.swipeBack()
      if @collection.activeItem.get('description_style') == 'mini' or @collection.activeItem.get('description_style') == 'none'
        e.preventDefault()
      else
        e.stopPropagation()

  shouldBotherWithTouch: (e)->
    @getOption('orientation') == 'horizontal' and Math.abs() > threshold or
      @getOption('orientation') == 'vertical' and Math.abs(e.pageY - @touchStartedAt.top) > threshold
  onTouchEnd: (e)=>
    original = e
    threshold = 15

    original = e.changedTouches[0]

    diffX = original.pageX - @touchStartedAt.pageX
    diffY = original.pageY - @touchStartedAt.pageY
    if @getOption('orientation') == 'horizontal'
      if diffX > threshold and @lightbox.currentView.currentItemView.model.prev()
        @lightbox.currentView.currentItemView.swipeBack()
        @lightbox.currentView.currentItemView.model.prev().activate()
      if diffX <  -threshold and @lightbox.currentView.currentItemView.model.next()
        @lightbox.currentView.currentItemView.swipeBack()
        @lightbox.currentView.currentItemView.model.next().activate()
    if @getOption('orientation') == 'vertical'
      if diffY > threshold and @lightbox.currentView.currentItemView.model.prev()
        @lightbox.currentView.currentItemView.swipeBack()
        @lightbox.currentView.currentItemView.model.prev().activate()
      if diffY <  -threshold and @lightbox.currentView.currentItemView.model.next()
        @lightbox.currentView.currentItemView.swipeBack()
        @lightbox.currentView.currentItemView.model.next().activate()
    @lightbox.currentView.currentItemView.swipeBack()
    @touchStartedAt = null
  @contentViewTypes: ->
    image:
      condition: /\.(gif|png|jpeg|jpg)$/i
      class: Uberbox.ImageObjectView
    youtube:
      condition: /((\(\/\/)?(www\.)?youtube\.com\/watch\?v=.+)|((\/\/)(www\.)?youtu\.be\/.*)/i
      class: Uberbox.YoutubeObjectView
    vimeo:
      condition: /(\/\/)?vimeo\.com\/\d+/i
      class: Uberbox.VimeoObjectView
    soundcloud:
      condition: /soundcloud\.com/i
      class: Uberbox.SoundcloudObjectView
    bandcamp:
      condition: /bandcamp\.com/i
      class: Uberbox.BandcampObjectView
    iframe:
      condition: /(\/|\.html|\.htm|\.php|.aspx)$/i
      class: Uberbox.IframeObjectView
    gmap:
      condition: /(google\.(\w+)\/maps\/)|(maps\.google\.(\w+))|(goo\.gl\/maps\/)/i
      class: Uberbox.GoogleMapsObjectView
    html:
      condition: (item)-> !!item.get('html')
      class: Uberbox.HTMLObjectView
    ajax:
      condition: (item) -> item.get('ajax')
      class: Uberbox.AJAXOBjectView
    unknown:
      class: Uberbox.UnknownItemView

  @show: (items, options = {})->
    options = _.extend({
      current: 0
      orientation: 'vertical'
      collection: new Uberbox.ItemCollection(items)
      carousel: false
    }, options)
    return unless items and items.length > 0
    @instances.push uberbox = new Uberbox(options)
    uberbox
  @close: ->
    if @instances.length > 0
      instance = @instances.pop()
      Uberbox.Utils.exitFullscreen() if Uberbox.Utils.isFullscreen()
      instance.remove()



  @getPixelRatio: -> if window.devicePixelRatio > 0 then window.devicePixelRatio else 1
  @getObjectViewType: (item)=>
    return @contentViewTypes()[type]['class'] if type = item.get('type')
    for type, config of @contentViewTypes()
      condition = false
      if config.condition
        if _.isRegExp(config.condition) and url = item.get('url')
          condition = item.get('url').match(config.condition)
        if _.isFunction(config.condition)
          condition = config.condition(item)
      else
        condition = true
      return config.class if condition
    return @contentViewTypes().unknown

  constructor: (options)->
    super _.extend {el: jQuery('<div class="uberbox" />').appendTo(jQuery('body'))}, options
  initialize: ->
    super
    @render()
    @bindUIElements()
    @$el.addClass("uberbox-#{@getOption('orientation')}")
    @showOverlay()

    lightboxOptions = _.extend {}, @options, {root: @$el}
    delete lightboxOptions.el
    @lightbox.show(new Uberbox.Lightbox(lightboxOptions))
    @listenTo(@lightbox.currentView, 'close', => @remove())
    if @getOption('carousel')
      if jQuery(window).width() > 1024
        @$el.addClass('uberbox-has-carousel')
        @carousel.show(new Uberbox.Carousel(lightboxOptions))
      jQuery(window).on 'resize.uberbox-main', =>
        if jQuery(window).width() < 1024
          @carousel.empty()
          @$el.removeClass('uberbox-has-carousel')
        else if !@carousel.currentView
          @$el.addClass('uberbox-has-carousel')
          @carousel.show(new Uberbox.Carousel(lightboxOptions))
    else
      @$('.uberbox-carousel-wrapper').remove()
    @listenTo @getOption('collection'), 'close', => Uberbox.close()
    @listenTo @getOption('collection'),  'activate', @onItemActivated
    current = @getOption('collection').at(@getOption('current'))
    current.activate()
    jQuery('body').on 'keydown', @onKeyDown
    $html = jQuery('html')
    @overflow = $html.css('overflow')
    $html.css('overflow', 'hidden')
    @el.addEventListener('touchstart', @onTouchStart)
    @el.addEventListener('touchend', @onTouchEnd)
    @el.addEventListener('touchmove', @onTouchMove)
  onItemActivated: (item)=>
    if @toolbar.currentView
      @stopListening @toolbar.currentView, 'close'
    @toolbar.show(new Uberbox.ToolbarView(model: item))
    @listenTo @toolbar.currentView, 'close', => @close()
    @showLoader() unless item.get('loaded')
    if @oldActiveItem
      @stopListening @oldActiveItem, 'load'
    @oldActiveItem = item
    @listenTo item, 'load', => @hideLoader()
  hideLoader: ->
    if @showLoaderTimeout
      clearTimeout @showLoaderTimeout
      @showLoaderTimeout = null
    @$el.find('div.uberbox-loader').remove()
  showLoader: ->
    return if @showLoaderTimeout
    @showLoaderTimeout = setTimeout((=>
      @$el.append(jQuery('<div class="uberbox-loader uberbox-icon-arrows-ccw">'))
    ), 100)
  remove: ->
    @trigger('close')
    super
    if Uberbox.Utils.isFullscreen()
      Uberbox.Utils.exitFullscreen()
    @ui.overlay.removeClass('visible')
    jQuery('body').off 'keydown.uberbox', @onKeyDown
    jQuery('html').css('overflow', @overflow)
    @el.removeEventListener('touchstart', @onTouchStart)
    @el.removeEventListener('touchend', @onTouchEnd)
    @el.removeEventListener('touchmove', @onTouchMove)
    setTimeout((=> @ui.overlay.remove()), 600)
  onKeyDown: (e)=>
    if e.which == 27
      e.preventDefault()
      @remove()
    if (e.which == 37 or e.which == 38)
      @collection.activatePrev()
      return false
    if e.which == 40 or e.which == 39
      @collection.activateNext()
      return false
  showOverlay: ->
    @ui.overlay = jQuery('<div class="uberbox-overlay" />').appendTo(jQuery('body'))
    _.defer => @ui.overlay.addClass 'visible'
    @ui.overlay.on 'click', => @remove()
