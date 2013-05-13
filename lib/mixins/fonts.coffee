PDFFont = require '../font'

module.exports = 
    initFonts: ->
        # Lookup table for embedded fonts
        @_fontFamilies = {}
        @_fontCount = 0
        
        # Font state
        @_fontSize = 12
        @_font = null
        
        @_registeredFonts = {}
        
        # Set the default font
        @font 'Helvetica'
        
    font: (filename, family, size) ->
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
        @_font = new PDFFont(this, filename, family, id)
        @_fontFamilies[family] = @_font
        
        return this
        
    fontSize: (@_fontSize) ->
        return this
        
    currentLineHeight: (includeGap = false) ->
        @_font.lineHeight @_fontSize, includeGap
        
    registerFont: (name, path, family) ->
        @_registeredFonts[name] = 
            filename: path
            family: family            
            
    embedFonts: (fn) ->
        fonts = (font for family, font of @_fontFamilies)
        do proceed = =>
            return fn() if fonts.length is 0
            fonts.shift().embed(proceed)