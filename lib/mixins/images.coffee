PDFImage = require '../image'

module.exports =
  initImages: ->
    @_imageRegistry = {}
    @_imageCount = 0
    
  image: (src, x, y, options = {}) ->
    if typeof x is 'object'
      options = x
      x = null
    
    x = x ? options.x ? @x
    y = y ? options.y ? @y
    
    unless Buffer.isBuffer(src)
      image = @_imageRegistry[src]
      
    if not image
      image = PDFImage.open src, 'I' + (++@_imageCount)
      image.embed this
      unless Buffer.isBuffer(src)
        @_imageRegistry[src] = image
        
    @page.xobjects[image.label] ?= image.obj

    w = options.width or image.width
    h = options.height or image.height
    
    if options.width and not options.height
      wp = w / image.width
      w = image.width * wp
      h = image.height * wp

    else if options.height and not options.width
      hp = h / image.height
      w = image.width * hp
      h = image.height * hp

    else if options.scale
      w = image.width * options.scale
      h = image.height * options.scale

    else if options.fit
      [bw, bh] = options.fit
      bp = bw / bh
      ip = image.width / image.height
      if ip > bp
        w = bw
        h = bw / ip
      else
        h = bh
        w = bh * ip
      
      if options.align is 'center'
        x = x + bw / 2 - w / 2
        
      else if options.align is 'right'
        x = x + bw - w
        
      if options.valign is 'center'
        y = y + bh / 2 - h / 2
        
      else if options.valign is 'bottom'
        y = y + bh - h
    
    # Set the current y position to below the image if it is in the document flow      
    @y += h if @y is y

    @save()
    @transform w, 0, 0, -h, x, y + h
    @addContent "/#{image.label} Do"
    @restore()
      
    return this
