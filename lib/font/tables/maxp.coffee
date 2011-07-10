Table = require '../table'

class MaxpTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @version = data.readInt()
        @numGlyphs = data.readUInt16()
        @maxPoints = data.readUInt16()
        @maxContours = data.readUInt16()
        @maxCompositePoints = data.readUInt16()
        @maxComponentContours = data.readUInt16()
        @maxZones = data.readUInt16()
        @maxTwilightPoints = data.readUInt16()
        @maxStorage = data.readUInt16()
        @maxFunctionDefs = data.readUInt16()
        @maxInstructionDefs = data.readUInt16()
        @maxStackElements = data.readUInt16()
        @maxSizeOfInstructions = data.readUInt16()
        @maxComponentElements = data.readUInt16()
        @maxComponentDepth = data.readUInt16()
        
module.exports = MaxpTable