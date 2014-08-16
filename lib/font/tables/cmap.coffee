Table = require '../table'
Data = require '../../data'

class CmapTable extends Table
  parse: (data) ->
    data.pos = @offset
    
    @version = data.readUInt16()
    tableCount = data.readUInt16()
    @tables = []
    @unicode = null
    
    for i in [0...tableCount]
      entry = new CmapEntry(data, @offset)
      @tables.push entry
      @unicode ?= entry if entry.isUnicode
      
    return true
    
  @encode: (charmap, encoding = 'macroman') ->
    result = CmapEntry.encode(charmap, encoding)
    table = new Data
    
    table.writeUInt16 0 # version
    table.writeUInt16 1 # tableCount
    
    result.table = table.data.concat(result.subtable)
    return result
      
class CmapEntry
  constructor: (data, offset) ->
    @platformID = data.readUInt16()
    @encodingID = data.readShort()
    @offset = offset + data.readInt()

    saveOffset = data.pos
    
    data.pos = @offset
    @format = data.readUInt16()
    @length = data.readUInt16()
    @language = data.readUInt16()
    
    @isUnicode = (@platformID is 3 and @encodingID is 1 and @format is 4) or @platformID is 0 and @format is 4
    
    @codeMap = {}
    switch @format
      when 0
        for i in [0...256]
          @codeMap[i] = data.readByte()
      
      when 4
        segCountX2 = data.readUInt16()
        segCount = segCountX2 / 2
        
        data.pos += 6 # skip searching hints
        endCode = (data.readUInt16() for i in [0...segCount])
        data.pos += 2 # skip reserved value
        
        startCode = (data.readUInt16() for i in [0...segCount])
        idDelta = (data.readUInt16() for i in [0...segCount])
        idRangeOffset = (data.readUInt16() for i in [0...segCount])
        
        count = (@length - data.pos + @offset) / 2
        glyphIds = (data.readUInt16() for i in [0...count])
        
        for tail, i in endCode
          start = startCode[i]
          for code in [start..tail]
            if idRangeOffset[i] is 0
              glyphId = code + idDelta[i]
            else
              index = idRangeOffset[i] / 2 + (code - start) - (segCount - i)
              glyphId = glyphIds[index] or 0
              glyphId += idDelta[i] if glyphId isnt 0
              
            @codeMap[code] = glyphId & 0xFFFF

    data.pos = saveOffset
            
  @encode: (charmap, encoding) ->
    subtable = new Data
    codes = Object.keys(charmap).sort (a, b) -> a - b
    
    switch encoding
      when 'macroman'
        id = 0
        indexes = (0 for i in [0...256])
        map = { 0: 0 }
        codeMap = {}
        
        for code in codes
          map[charmap[code]] ?= ++id
          codeMap[code] = 
            old: charmap[code]
            new: map[charmap[code]]
            
          indexes[code] = map[charmap[code]]
          
        subtable.writeUInt16 1   # platformID
        subtable.writeUInt16 0   # encodingID
        subtable.writeUInt32 12  # offset
        subtable.writeUInt16 0   # format
        subtable.writeUInt16 262 # length
        subtable.writeUInt16 0   # language
        subtable.write indexes   # glyph indexes
        
        result = 
          charMap: codeMap
          subtable: subtable.data
          maxGlyphID: id + 1
        
      when 'unicode'
        startCodes = []
        endCodes = []
        nextID = 0
        map = {}
        charMap = {}
        last = diff = null
        
        for code in codes
          old = charmap[code]
          map[old] ?= ++nextID
          charMap[code] = 
            old: old
            new: map[old]
          
          delta = map[old] - code
          if not last? or delta isnt diff
            endCodes.push last if last
            startCodes.push code
            diff = delta

          last = code
          
        endCodes.push last if last
        endCodes.push 0xFFFF
        startCodes.push 0xFFFF
        
        segCount = startCodes.length
        segCountX2 = segCount * 2
        searchRange = 2 * Math.pow(Math.log(segCount) / Math.LN2, 2)
        entrySelector = Math.log(searchRange / 2) / Math.LN2
        rangeShift = 2 * segCount - searchRange
        
        deltas = []
        rangeOffsets = []
        glyphIDs = []
        
        for startCode, i in startCodes
          endCode = endCodes[i]
          
          if startCode is 0xFFFF
            deltas.push 0
            rangeOffsets.push 0
            break
            
          startGlyph = charMap[startCode].new
          if startCode - startGlyph >= 0x8000
            deltas.push 0
            rangeOffsets.push 2 * (glyphIDs.length + segCount - i)
            
            for code in [startCode..endCode]
              glyphIDs.push charMap[code].new
              
          else
            deltas.push startGlyph - startCode
            rangeOffsets.push 0
                        
        subtable.writeUInt16 3  # platformID
        subtable.writeUInt16 1  # encodingID
        subtable.writeUInt32 12 # offset
        subtable.writeUInt16 4  # format
        subtable.writeUInt16 16 + segCount * 8 + glyphIDs.length * 2 # length
        subtable.writeUInt16 0  # language
        subtable.writeUInt16 segCountX2
        subtable.writeUInt16 searchRange
        subtable.writeUInt16 entrySelector
        subtable.writeUInt16 rangeShift
        
        subtable.writeUInt16 code for code in endCodes
        subtable.writeUInt16 0  # reserved value
        subtable.writeUInt16 code for code in startCodes
        
        subtable.writeUInt16 delta for delta in deltas
        subtable.writeUInt16 offset for offset in rangeOffsets
        subtable.writeUInt16 id for id in glyphIDs
        
        result = 
          charMap: charMap
          subtable: subtable.data
          maxGlyphID: nextID + 1
    
module.exports = CmapTable
