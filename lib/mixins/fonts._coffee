PDFFont = require '../font'

module.exports = 
    initFonts: (_) ->
        # Lookup table for embedded fonts
        @_fontFamilies = {}
        @_fontCount = 0
        
        # Font state
        @_fontSize = 12
        @_font = null
        
        @_registeredFonts = {}
        
        # Set the default font
        @font _, 'Helvetica'
        
    font: (_, filename, family, size) ->
        if typeof family is 'number'
            size = family
            family = null
        
        if @_registeredFonts[filename]
            {filename, family} = @_registeredFonts[filename]
        
        @fontSize size if size?    
        family ?= filename
        
        if @_fontFamilies[family]
            @_font = @_fontFamilies[family]
            return this
            
        id = 'F' + (++@_fontCount)
        @_font = new PDFFont(_, this, filename, family, id)
        @_fontFamilies[family] = @_font
        
        return this
        
    fontSize: (@_fontSize) ->
        return this
        
    widthOfString: (string) ->
        @_font.widthOfString string, @_fontSize
        
    currentLineHeight: (includeGap = false) ->
        @_font.lineHeight @_fontSize, includeGap
        
    registerFont: (name, path, family) ->
        @_registeredFonts[name] = 
            filename: path
            family: family