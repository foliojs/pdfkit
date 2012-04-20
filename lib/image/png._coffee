fs = require 'fs'
Data = '../data'
zlib = require 'zlib'

class PNG
    @open: (_, filename) ->
        contents = fs.readFile filename, _
        data = new Data(contents)
        new PNG(data)
    
    constructor: (@data) ->
        data.pos = 8 # Skip the default header
        
        @palette = []
        @imgData = []
        @transparency = {}
        
        loop
            chunkSize = data.readUInt32()            
            section = data.readString(4)
            
            switch section
                when 'IHDR'
                    # we can grab  interesting values from here (like width, height, etc)
                    @width = data.readUInt32()
                    @height = data.readUInt32()
                    @bits = data.readByte()
                    @colorType = data.readByte()
                    @compressionMethod = data.readByte()
                    @filterMethod = data.readByte()
                    @interlaceMethod = data.readByte()
                                        
                when 'PLTE'
                    @palette = data.read(chunkSize)
                    
                when 'IDAT'
                    for i in [0...chunkSize]
                        @imgData.push data.readByte()
                    
                when 'tRNS'
                    # This chunk can only occur once and it must occur after the
                    # PLTE chunk and before the IDAT chunk.
                    @transparency = {}
                    switch @colorType
                        when 3
                            # Indexed color, RGB. Each byte in this chunk is an alpha for
                            # the palette index in the PLTE ("palette") chunk up until the
                            # last non-opaque entry. Set up an array, stretching over all
                            # palette entries which will be 0 (opaque) or 1 (transparent).
                            @transparency.indexed = data.read(chunkSize)
                            short = 255 - @transparency.indexed.length
                            if short > 0
                                @transparency.indexed.push 255 for i in [0...short]
                        when 0
                            # Greyscale. Corresponding to entries in the PLTE chunk.
                            # Grey is two bytes, range 0 .. (2 ^ bit-depth) - 1
                            @transparency.grayscale = data.read(chunkSize)[0]
                        when 2
                            # True color with proper alpha channel.
                            @transparency.rgb = data.read(chunkSize)
                            
                when 'IEND'
                    # we've got everything we need!
                    @colors = switch @colorType
                        when 0, 3, 4 then 1
                        when 2, 6 then 3
                    
                    @hasAlphaChannel = @colorType in [4, 6]
                    colors = @colors + if @hasAlphaChannel then 1 else 0    
                    @pixelBitlength = @bits * colors
                        
                    @colorSpace = switch @colors
                        when 1 then 'DeviceGray'
                        when 3 then 'DeviceRGB'
                    
                    @imgData = new Buffer @imgData
                    return
                    
                else
                    # unknown (or unimportant) section, skip it
                    data.pos += chunkSize
            
            data.pos += 4 # Skip the CRC
        
        return
        
    object: (_, document) ->
        obj = document.ref
            Type: 'XObject'
            Subtype: 'Image'
            BitsPerComponent: @bits
            Width: @width
            Height: @height
            Length: @imgData.length
            Filter: 'FlateDecode'
        
        unless @hasAlphaChannel
            obj.data['DecodeParms'] = 
                Predictor: 15
                Colors: @colors
                BitsPerComponent: @bits
                Columns: @width
                
        if @palette.length is 0
            obj.data['ColorSpace'] = @colorSpace
        else
            # embed the color palette in the PDF as an object stream
            palette = document.ref
                Length: @palette.length
                
            palette.add new Buffer(@palette)
            
            # build the color space array for the image
            obj.data['ColorSpace'] = ['Indexed', 'DeviceRGB', (@palette.length / 3) - 1, palette]
            
        # For PNG color types 0, 2 and 3, the transparency data is stored in
        # a dedicated PNG chunk.
        if @transparency.grayscale
            # Use Color Key Masking (spec section 4.8.5)
            # An array with N elements, where N is two times the number of color components.
            val = @transparency.greyscale
            obj.data['Mask'] = [val, val]
        
        else if @transparency.rgb
            # Use Color Key Masking (spec section 4.8.5)
            # An array with N elements, where N is two times the number of color components.
            rgb = @transparency.rgb
            mask = []
            for x in rgb
                mask.push x, x
                
            obj.data['Mask'] = mask
            
        else if @transparency.indexed
            # Create a transparency SMask for the image based on the data 
            # in the PLTE and tRNS sections. See below for details on SMasks.
            @loadIndexedAlphaChannel(_)
            
        # For PNG color types 4 and 6, the transparency data is stored as a alpha
        # channel mixed in with the main image data. Separate this data out into an
        # SMask object and store it separately in the PDF.
        if @hasAlphaChannel
            @splitAlphaChannel(_)
            obj.data['Length'] = @imgData.length
        
        if @alphaChannel
            sMask = document.ref
                Type: 'XObject'
                Subtype: 'Image'
                Height: @height
                Width: @width
                BitsPerComponent: 8
                Length: @alphaChannel.length
                Filter: 'FlateDecode'
                ColorSpace: 'DeviceGray'
                Decode: [0, 1]
                
            sMask.add @alphaChannel
            obj.data['SMask'] = sMask
        
        # add the actual image data    
        obj.add @imgData
        return obj
        
    decodePixels: (_) ->
        data = zlib.inflate @imgData, _
        pixelBytes = @pixelBitlength / 8
        scanlineLength = pixelBytes * @width

        row = 0
        pixels = []
        length = data.length
        pos = 0

        while pos < length
            filter = data[pos++]
            i = 0
            rowData = []

            switch filter
                when 0 # None
                    while i < scanlineLength
                        rowData[i++] = data[pos++]

                when 1 # Sub
                    while i < scanlineLength
                        byte = data[pos++]
                        left = if i < pixelBytes then 0 else rowData[i - pixelBytes]
                        rowData[i++] = (byte + left) % 256

                when 2 # Up
                    while i < scanlineLength
                        byte = data[pos++]
                        col = (i - (i % pixelBytes)) / pixelBytes
                        upper = if row is 0 then 0 else pixels[row - 1][col][i % pixelBytes]
                        rowData[i++] = (upper + byte) % 256

                when 3 # Average
                    while i < scanlineLength
                        byte = data[pos++]
                        col = (i - (i % pixelBytes)) / pixelBytes
                        left = if i < pixelBytes then 0 else rowData[i - pixelBytes]
                        upper = if row is 0 then 0 else pixels[row - 1][col][i % pixelBytes]
                        rowData[i++] = (byte + Math.floor((left + upper) / 2)) % 256

                when 4 # Paeth
                    while i < scanlineLength
                        byte = data[pos++]
                        col = (i - (i % pixelBytes)) / pixelBytes
                        left = if i < pixelBytes then 0 else rowData[i - pixelBytes]

                        if row is 0
                            upper = upperLeft = 0
                        else
                            upper = pixels[row - 1][col][i % pixelBytes]
                            upperLeft = if col is 0 then 0 else pixels[row - 1][col - 1][i % pixelBytes]

                        p = left + upper - upperLeft
                        pa = Math.abs(p - left)
                        pb = Math.abs(p - upper)
                        pc = Math.abs(p - upperLeft)

                        if pa <= pb and pa <= pc
                            paeth = left
                        else if pb <= pc
                            paeth = upper
                        else
                            paeth = upperLeft

                        rowData[i++] = (byte + paeth) % 256

                else
                    throw new Error "Invalid filter algorithm: " + filter 

            s = []
            for i in [0...rowData.length] by pixelBytes
                s.push rowData.slice(i, i + pixelBytes)

            pixels.push(s)
            row += 1
            
        return pixels
        
    splitAlphaChannel:(_)  ->
        pixels = @decodePixels(_)

        colorByteSize = @colors * @bits / 8
        alphaByteSize = 1

        pixelCount = @width * @height
        imgData = new Buffer(pixelCount * colorByteSize)
        alphaChannel = new Buffer(pixelCount)
        
        p = a = 0
        for row in pixels
            for pixel in row
                imgData[p++] = pixel[i] for i in [0...colorByteSize]
                alphaChannel[a++] = pixel[colorByteSize]
        
        @imgData = zlib.deflate imgData, _
        @alphaChannel = zlib.deflate alphaChannel, _
        
    decodePalette: ->
        palette = @palette
        transparency = @transparency.indexed ? []
        decodingMap = []
        index = 0
        
        for i in [0...palette.length] by 3
            alpha = transparency[index++] ? 255
            pixel = palette.slice(i, i + 3).concat(alpha)
            decodingMap.push pixel
            
        return decodingMap
        
    loadIndexedAlphaChannel:(_) ->
        palette = @decodePalette()
        pixels = @decodePixels(_)
        
        pixelCount = @width * @height
        alphaChannel = new Buffer(pixelCount)
        
        i = 0
        for row in pixels
            for pixel in row
                pixel = pixel[0]
                alphaChannel[i++] = palette[pixel][3]
            
        @alphaChannel = zlib.deflate alphaChannel, _
        
module.exports = PNG