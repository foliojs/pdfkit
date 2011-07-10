Table = require '../table'

class HheaTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @version = data.readInt()
        @ascender = data.readShort()
        @decender = data.readShort()
        @lineGap = data.readShort()
        @advanceWidthMax = data.readShort()
        @minLeftSideBearing = data.readShort()
        @minRightSideBearing = data.readShort()
        @xMaxExtent = data.readShort()
        @caretSlopeRise = data.readShort()
        @caretSlopeRun = data.readShort()
        @caretOffset = data.readShort()
        
        data.pos += 4 * 2 # skip 4 reserved int16 slots
        
        @metricDataFormat = data.readShort()
        @numberOfMetrics = data.readUInt16()
        
module.exports = HheaTable