fs = require 'fs'

MARKERS = [0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC5, 0xFFC6, 0xFFC7,
           0xFFC8, 0xFFC9, 0xFFCA, 0xFFCB, 0xFFCC, 0xFFCD, 0xFFCE, 0xFFCF]

getMetaInfo = (data, result = {}) ->
  if data.readUInt16BE(0) isnt 0xFFD8
    throw "SOI not found in JPEG"

  pos = 2
  while pos < data.length
    marker = data.readUInt16BE(pos)
    pos += 2
    break if marker in MARKERS
    pos += data.readUInt16BE(pos)

  throw "Invalid JPEG." unless marker in MARKERS
  pos += 2

  result.bits = data[pos++]
  result.height = data.readUInt16BE(pos)
  pos += 2

  result.width = data.readUInt16BE(pos)
  pos += 2

  channels = data[pos++]
  result.colorSpace = switch channels
    when 1 then 'DeviceGray'
    when 3 then 'DeviceRGB'
    when 4 then 'DeviceCMYK'

  result

class JPEG

  # Returns true if the given data buffer has a JPEG signature
  @is: (data) ->
    data[0] is 0xff and data[1] is 0xd8

  constructor: (@data, @label, @alphaData) ->
    getMetaInfo @data, @
    if @alphaData
      @alphaMeta = getMetaInfo @alphaData
      if @alphaMeta.colorSpace != 'DeviceGray'
        throw new Error('Alpha mask must be a gray JPEG image')


    @obj = null

  embed: (document) ->
    return if @obj

    @obj = document.ref
      Type: 'XObject'
      Subtype: 'Image'
      BitsPerComponent: @bits
      Width: @width
      Height: @height
      ColorSpace: @colorSpace
      Filter: 'DCTDecode'

    # add extra decode params for CMYK images. By swapping the
    # min and max values from the default, we invert the colors. See
    # section 4.8.4 of the spec.
    if @colorSpace is 'DeviceCMYK'
      @obj.data['Decode'] = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0]

    if @alphaData

      sMask = document.ref
        Type: 'XObject'
        Subtype: 'Image'
        Height: @alphaMeta.height
        Width: @alphaMeta.width
        BitsPerComponent: 8
        Filter: 'DCTDecode'
        ColorSpace: 'DeviceGray'
        Decode: [0, 1]

      sMask.end @alphaData

      # free memory
      @alphaData = null

      @obj.data['SMask'] = sMask


    @obj.end @data

    # free memory
    @data = null

module.exports = JPEG
