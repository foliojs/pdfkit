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

        if @_imageRegistry[src]
            [image, label, pages] = @_imageRegistry[src]
            pages.push @page unless @page in pages

        else
            image = PDFImage.open(src)
            label = "I" + (++@_imageCount)
            @_imageRegistry[src] = [image, label, [@page]]

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
        
        # Set the current y position to below the image if it is in the document flow            
        @y += h if @y is y

        @save()
        @transform w, 0, 0, -h, x, y + h
        @addContent "/#{label} Do"
        @restore()
            
        return this
        
    embedImages: (fn) ->
        images = (item for src, item of @_imageRegistry)
        do proceed = =>
            if images.length
                [image, label, pages] = images.shift()
                image.object this, (obj) ->
                    for page in pages
                        page.xobjects[label] ?= obj
                        
                    proceed()
            else
                fn()