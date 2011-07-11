# This regular expression is used for splitting a string into wrappable words
WORD_RE = /([^ ,\/!.?:;\-\n]+[ ,\/!.?:;\-]*)|\n/g

module.exports = 
    initText: ->
        # Current coordinates
        @x = 0
        @y = 0
        @_lineGap = 0
        
    lineGap: (@_lineGap) ->
        return this
        
    text: (text, x = {}, y, options = {}) ->
        if typeof x is 'object'
            options = x
            x = null
        
        @x = x or options.x or @x
        @y = y or options.y or @y
        {x, y} = this
        
        # More options: characterSpacing, wordSpacing, etc.
        lineGap = options.lineGap ? @_lineGap
        
        align = options.align or 'left'
        text = '' + text
        
        # add current font to page if necessary
        @page.fonts[@_font.id] ?= @_font.ref
        
        # word wrapping
        if options.width
            return @_wrap text, options
            
        # support newlines in text
        if (matches = text.split '\n').length > 1
            @text match, { align } for match in matches
            return this
            
        # text alignment support
        if options.lineWidth
            switch align
                when 'right'
                    x += (options.lineWidth or 0) - @widthOfString text
                
                when 'center'
                    x += options.lineWidth / 2 - @widthOfString(text) / 2
                
                when 'justify'
                    break if options.lastLine
                
                    words = text.match(WORD_RE)
                    break unless words
                                    
                    textWidth = @widthOfString text.replace(/\s+/g, '')
                    lineWidth = options.lineWidth
                    lineWidth -= options.indent or 0 if options.firstLine
                    wordSpacing = (lineWidth - textWidth) / (words.length - 1)
                    
                    # configure options for fragments
                    fragmentOptions = {}
                    for key, val of options when key not in ['align', 'lineWidth', 'lastLine']
                        fragmentOptions[key] = val
                    
                    # render each word individually for now; might want to set temporary word spacing...
                    originalX = x
                    for word in words
                        word = word.trim()
                        @text word, x, y, fragmentOptions
                        x += @widthOfString(word) + wordSpacing
                    
                    @x = originalX
                    return this
                    
        # indentation support
        if options.firstLine
            x += options.indent if options.indent
            @y = y += options.paragraphGap if options.paragraphGap and not options.firstParagraph
        
        y = @page.height - y - (@_font.ascender / 1000 * @_fontSize)
        text = @_escape text
        
        # begin the text object
        @addContent "BT"
        
        # text position
        @addContent "#{x} #{y} Td"
        
        # font and font size
        @addContent "/#{@_font.id} #{@_fontSize} Tf"
        
        # rendering mode
        mode = if options.fill and options.stroke then 2 else if options.stroke then 1 else 0
        @addContent "#{mode} Tr" unless mode is 0
        
        # add the actual text
        @addContent "(#{text}) Tj"
        
        # reset rendering mode so that it doesn't affect the next text object
        @addContent '0 Tr' unless mode is 0
        
        # end the text object
        @addContent "ET"
        
        @y += @currentLineHeight(true) + lineGap
        return this
        
    _escape: (text) ->
        ('' + text)
            .replace(/\\/g, '\\\\\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
    
    _wrap: (text, options) ->
        {_font: font, _fontSize: size} = this
        {width:lineWidth, height:maxHeight, align} = options
        width = @widthOfString.bind this
        maxY = @y + maxHeight
        
        options.lineWidth = lineWidth
        options.firstLine = true
        options.firstParagraph = true
        delete options.width
        delete options.height
        
        spaceLeft = lineWidth - (options.indent or 0)
        words = text.match(WORD_RE)
        lineHeight = @currentLineHeight(true)
        wordWidths = {}
        len = words.length
        buffer = ''
        
        for word, i in words
            w = wordWidths[word] ?= width(word)

            if w > spaceLeft or word is '\n'
                if options.lastLine
                    options.firstParagraph = false
                    options.firstLine = true
                    options.lastLine = false
                
                if word is '\n'
                    options.lastLine = true
                
                lastLine = buffer.trim()
                @text lastLine, options
                
                options.firstLine = false
                return if @y > maxY
                
                spaceLeft = lineWidth - w
                buffer = if word is '\n' then '' else word
                
            else
                spaceLeft -= w
                buffer += word
        
        # add the last line
        options.lastLine = true
        @text buffer.trim(), options
        
    moveDown: (lines = 1) ->
        @y += @currentLineHeight(true) * lines + @_lineGap
        return this
        
    moveUp: (lines = 1) ->
        @y -= @currentLineHeight(true) * lines + @_lineGap
        return this
        
    list: (array, @x, @y) ->
        gap = Math.round (@_font.ascender / 1000 * @_fontSize) / 2
        
        for item in array
            @circle x + 3, @y + gap + 3, 3
            @text item, x + 15
            @y += 3
            
        @fill()