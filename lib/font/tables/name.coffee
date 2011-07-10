Table = require '../table'

class NameTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        format = data.readShort()
        count = data.readShort()
        stringOffset = data.readShort()
        
        entries = []
        for i in [0...count]
            entries.push
                platformID: data.readShort()
                encodingID: data.readShort()
                languageID: data.readShort()
                nameID: data.readShort()
                length: data.readShort()
                offset: @offset + stringOffset + data.readShort()
        
        strings = []
        for entry, i in entries
            data.pos = entry.offset
            text = data.readString(entry.length)
            strings[entry.nameID] ?= []
            strings[entry.nameID].push strip(text)
                    
        @copyright = strings[0]
        @fontFamily = strings[1]
        @fontSubfamily = strings[2]
        @uniqueSubfamily = strings[3]
        @fontName = strings[4]
        @version = strings[5]
        @postscriptName = strings[6][0] # should only be ONE postscript name
        @trademark = strings[7]
        @manufacturer = strings[8]
        @designer = strings[9]
        @description = strings[10]
        @vendorUrl = strings[11]
        @designerUrl = strings[12]
        @license = strings[13]
        @licenseUrl = strings[14]
        @preferredFamily = strings[15]
        @preferredSubfamily = strings[17]
        @compatibleFull = strings[18]
        @sampleText = strings[19]
        
    strip = (string) ->
        stripped = string.replace(/[\x00-\x19\x80-\xff]/g, "")
        stripped = "[not-postscript]" if stripped.length is 0
        return stripped
            
module.exports = NameTable