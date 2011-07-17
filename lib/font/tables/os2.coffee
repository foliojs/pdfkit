Table = require '../table'

class OS2Table extends Table
    constructor: ->
        @tag = 'OS/2'
        super
    
    parse: (data) ->
       data.pos = @offset
       
       @version = data.readUInt16()
       @averageCharWidth = data.readShort()
       @weightClass = data.readUInt16()
       @widthClass = data.readUInt16()
       @type = data.readShort()
       @ySubscriptXSize = data.readShort()
       @ySubscriptYSize = data.readShort()
       @ySubscriptXOffset = data.readShort()
       @ySubscriptYOffset = data.readShort()
       @ySuperscriptXSize = data.readShort()
       @ySuperscriptYSize = data.readShort()
       @ySuperscriptXOffset = data.readShort()
       @ySuperscriptYOffset = data.readShort()
       @yStrikeoutSize = data.readShort()
       @yStrikeoutPosition = data.readShort()
       @familyClass = data.readShort()
       
       @panose = (data.readByte() for i in [0...10])
       @charRange = (data.readInt() for i in [0...4])
       
       @vendorID = data.readString(4)
       @selection = data.readShort()
       @firstCharIndex = data.readShort()
       @lastCharIndex = data.readShort()
       
       if @version > 0
           @ascent = data.readShort()
           @descent = data.readShort()
           @lineGap = data.readShort()
           @winAscent = data.readShort()
           @winDescent = data.readShort()
           @codePageRange = (data.readInt() for i in [0...2])
           
           if @version > 1
               @xHeight = data.readShort()
               @capHeight = data.readShort()
               @defaultChar = data.readShort()
               @breakChar = data.readShort()
               @maxContext = data.readShort()
               
    encode: ->
        return @raw()
           
module.exports = OS2Table