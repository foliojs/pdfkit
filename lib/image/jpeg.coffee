fs = require 'fs'
Data = '../data'

class JPEG
    @open: (filename) ->
        contents = fs.readFileSync filename
        data = new Data(contents)
        new JPEG(data)
    
    constructor: (@data) ->
        len = data.length
        
        if data.readUInt16() isnt 0xFFD8
            throw "SOI not found in JPEG"
        
        markers = [0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC4, 0xFFC5, 0xFFC6, 0xFFC7,
                   0xFFC8, 0xFFC9, 0xFFCA, 0xFFCB, 0xFFCC, 0xFFCD, 0xFFCE, 0xFFCF]
                
        while data.pos < len
            marker = data.readUInt16()
            break if marker in markers
            data.pos += data.readUInt16()
        
        throw "Invalid JPEG." unless marker in markers
        data.pos += 2
         
        @bits = data.readByte()
        @height = data.readShort()
        @width = data.readShort()
        
        channels = data.readByte()
        @colorSpace = switch channels
            when 1 then 'DeviceGray'
            when 3 then 'DeviceRGB'
            when 4 then 'DeviceCMYK'
            
        @imgData = @data
        
    object: (document) ->
        obj = document.ref
            Type: 'XObject'
            Subtype: 'Image'
            BitsPerComponent: @bits
            Width: @width
            Height: @height
            Length: @data.length
            ColorSpace: @colorSpace
            Filter: 'DCTDecode'
            
        # add extra decode params for CMYK images. By swapping the
        # min and max values from the default, we invert the colors. See
        # section 4.8.4 of the spec.    
        if @colorSpace is 'DeviceCMYK'
            obj.data['Decode'] = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]
            
        obj.add @data.data
        return obj
        
module.exports = JPEG