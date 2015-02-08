class JPEG
  MARKERS = [0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC5, 0xFFC6, 0xFFC7,
             0xFFC8, 0xFFC9, 0xFFCA, 0xFFCB, 0xFFCC, 0xFFCD, 0xFFCE, 0xFFCF]
  
  constructor: (@source, @label) ->
    @obj = null
          
  embed: (document) ->
    return if @obj
    
    @obj = document.ref
      Type: 'XObject'
      Subtype: 'Image'
      Filter: 'DCTDecode'
    
    # Read the metadata synchronously
    data = @read(2)
    if data.readUInt16BE(0) isnt 0xFFD8
      throw "SOI not found in JPEG"
      
    while data
      data = @read(2)
      marker = data.readUInt16BE(0)
      break if marker in MARKERS
      
      data = @read 2
      len = data.readUInt16BE(0)
      @read len - 2

    throw "Invalid JPEG." unless marker in MARKERS
    
    data = @read 8
    @obj.data.BitsPerComponent = data[2]
    @height = @obj.data.Height = data.readUInt16BE(3)
    @width = @obj.data.Width = data.readUInt16BE(5)
    channels = data[7]
    
    @obj.data.ColorSpace = switch channels
      when 1 then 'DeviceGray'
      when 3 then 'DeviceRGB'
      when 4 then 'DeviceCMYK'
  
    # add extra decode params for CMYK images. By swapping the
    # min and max values from the default, we invert the colors. See
    # section 4.8.4 of the spec.  
    if @obj.data.ColorSpace is 'DeviceCMYK'
      @obj.data['Decode'] = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]
      
    # Now pipe the rest of the file to the PDF stream (asynchronous).
    @source.pipe @obj
    
  # Synchronously reads n bytes from the source stream
  # and writes the result to the PDF stream object.
  read: (n) ->
    while n > 0
      data = @source.read(Math.min(@source.bufferSize, n))
      throw "Invalid JPEG." unless data
      n -= data.length
      @obj.write data
      
    return data
    
module.exports = JPEG
