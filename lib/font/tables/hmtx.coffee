Table = require '../table'

class HmtxTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @metrics = []
        for i in [0...@file.hhea.numberOfMetrics]
            @metrics.push
                advance: data.readUInt16()
                lsb: data.readInt16()
                
        lsbCount = @file.maxp.numGlyphs - @file.hhea.numberOfMetrics
        @leftSideBearings = (data.readInt16() for i in [0...lsbCount])
        
        @widths = (m.advance for m in @metrics)
        last = @widths[@widths.length - 1]
        @widths.push(last) for i in [0...lsbCount]
        
module.exports = HmtxTable