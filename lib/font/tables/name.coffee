Table = require '../table'
Data = require '../../data'
utils = require '../utils'

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
        
        strings = {}
        for entry, i in entries
            data.pos = entry.offset
            text = data.readString(entry.length)
            name = new NameEntry text, entry
            
            strings[entry.nameID] ?= []
            strings[entry.nameID].push name
        
        @strings = strings            
        @copyright = strings[0]
        @fontFamily = strings[1]
        @fontSubfamily = strings[2]
        @uniqueSubfamily = strings[3]
        @fontName = strings[4]
        @version = strings[5]
        @postscriptName = strings[6][0].raw.replace(/[\x00-\x19\x80-\xff]/g, "") # should only be ONE postscript name
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
        
    subsetTag = "AAAAAA"
    encode: ->
        strings = {}
        strings[id] = val for id, val of @strings
        
        # generate a new postscript name for this subset
        postscriptName = new NameEntry "#{subsetTag}+#{@postscriptName}", 
            platformID: 1
            encodingID: 0
            languageID: 0
            
        strings[6] = [postscriptName]
        subsetTag = utils.successorOf(subsetTag)
        
        # count the number of strings in the table
        strCount = 0
        strCount += list.length for id, list of strings when list?
        
        table = new Data
        strTable = new Data
        
        table.writeShort 0                 # format
        table.writeShort strCount          # count
        table.writeShort 6 + 12 * strCount # stringOffset
        
        # write the strings
        for nameID, list of strings when list?
            for string in list
                table.writeShort string.platformID
                table.writeShort string.encodingID
                table.writeShort string.languageID
                table.writeShort nameID
                table.writeShort string.length
                table.writeShort strTable.pos
                
                # write the actual string
                strTable.writeString string.raw
        
        nameTable =
            postscriptName: postscriptName.raw
            table: table.data.concat(strTable.data)

module.exports = NameTable
                
class NameEntry
    constructor: (@raw, entry) ->
        @length = raw.length
        @platformID = entry.platformID
        @encodingID = entry.encodingID
        @languageID = entry.languageID