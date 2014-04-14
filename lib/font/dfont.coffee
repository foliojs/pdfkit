fs = require 'fs'
Data = require '../data'
Directory = require './directory'
NameTable = require './tables/name'

class DFont
  @open: (filename) ->
    contents = fs.readFileSync filename
    new DFont(contents)
    
  constructor: (contents) ->
    @contents = new Data(contents)
    @parse @contents
    
  parse: (data) ->
    dataOffset = data.readInt()
    mapOffset = data.readInt()
    dataLength = data.readInt()
    mapLength = data.readInt()
    
    @map = {}
    data.pos = mapOffset + 24 # skip header copy, next map handle, file reference, and attrs
    
    typeListOffset = data.readShort() + mapOffset
    nameListOffset = data.readShort() + mapOffset
    
    data.pos = typeListOffset
    maxIndex = data.readShort()
    
    for i in [0..maxIndex] by 1
      type = data.readString(4)
      maxTypeIndex = data.readShort()
      refListOffset = data.readShort()
      
      @map[type] =
        list: []
        named: {}
        
      pos = data.pos
      data.pos = typeListOffset + refListOffset
      
      for j in [0..maxTypeIndex] by 1
        id = data.readShort()
        nameOfs = data.readShort()
        attr = data.readByte()
        
        b2 = data.readByte() << 16
        b3 = data.readByte() << 8
        b4 = data.readByte()
        dataOfs = dataOffset + (0 | b2 | b3 | b4)
        
        handle = data.readUInt32()
        entry = 
          id: id
          attributes: attr
          offset: dataOfs
          handle: handle
        
        p = data.pos
        
        # if the name is easily accessible, parse it
        if nameOfs isnt -1 and (nameListOffset + nameOfs < mapOffset + mapLength)
          data.pos = nameListOffset + nameOfs
          len = data.readByte()
          entry.name = data.readString(len)
        
        # otherwise jump into the actual ttf and grab it from the 'name' table  
        else if type is 'sfnt'
          data.pos = entry.offset
          length = data.readUInt32()
          font = {}
          font.contents = new Data(data.slice(data.pos, data.pos + length))
          font.directory = new Directory(font.contents)
          name = new NameTable(font)
          entry.name = name.fontName[0].raw
        
        data.pos = p
        
        @map[type].list.push entry
        @map[type].named[entry.name] = entry if entry.name
        
      data.pos = pos
    
    return
    
  getNamedFont: (name) ->
    data = @contents
    pos = data.pos
    
    entry = @map.sfnt?.named[name]
    throw new Error "Font #{name} not found in DFont file." unless entry
    
    data.pos = entry.offset
    
    length = data.readUInt32()
    ret = data.slice(data.pos, data.pos + length)
    
    data.pos = pos
    return ret
    
module.exports = DFont