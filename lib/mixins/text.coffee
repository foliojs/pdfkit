# This regular expression is used for splitting a string into wrappable words
WORD_RE = /([^ ,\/!.?:;\-\n]+[ ,\/!.?:;\-]*)|\n/g

module.exports = 
    initText: ->
        # Current coordinates
        @x = 0
        @y = 0
        @_lineGap = 0
        
        # Keeps track of what has been set in the document
        @_textState = 
            mode: 0
            wordSpacing: 0
            characterSpacing: 0
            
        # state of the wrapping algorithm
        @_wrapState = {}
        
    lineGap: (@_lineGap) ->
        return this
        
    text: (text, x = {}, y, options = {}) ->
        if typeof x is 'object'
            options = x
            x = null
            
        # Convert text to a string
        text = '' + text
            
        # Update the current position
        if x? or y?
            @x = x or @x
            @y = y or @y
        
        # wrap to margins if no x or y position passed
        else
            margins = @page.margins
            options.width ?= @page.width - @x - margins.right
            options.height ?= @page.height - @y - margins.bottom
            
        # wrap to columns
        options.columns ||= 1
        options.columnGap ?= 18 # 1/4 inch
        
        # if the wordSpacing option is specified, remove multiple consecutive spaces
        if options.wordSpacing
            text = text.replace(/\s+/g, ' ')
        
        # word wrapping
        if options.width
            @_wrap text, options
        
        # newlines    
        else if (matches = text.split '\n').length > 1
            @_line match, options for match in matches
        
        # single line    
        else
            @_line text, options
            
        return this
        
    moveDown: (lines = 1) ->
        @y += @currentLineHeight(true) * lines + @_lineGap
        return this

    moveUp: (lines = 1) ->
        @y -= @currentLineHeight(true) * lines + @_lineGap
        return this

    list: (array, ox, oy) ->
        gap = Math.round (@_font.ascender / 1000 * @_fontSize) / 2
        @x = x = ox or @x
        @y = y = oy or @y

        for item in array
            @circle x + 3, @y + gap + 3, 3
            @text item, x + 15
            @y += 3
            
        @x = x
        @fill()
            
    _line: (text, options) ->
        wrap = @_wrapState
        paragraphGap = (wrap.firstLine and @y isnt wrap.startY and options.paragraphGap) or 0
        lineGap = options.lineGap or @_lineGap or 0
        
        @_fragment text, @x, @y + paragraphGap, options
        @y += @currentLineHeight(true) + lineGap + paragraphGap
            
    _fragment: (text, x, y, options = {}) ->
        text = '' + text
        return if text.length is 0
        
        state = @_textState
        wrap = @_wrapState
        
        # handle options
        align = options.align or 'left'
        indent = (wrap.firstLine and options.indent) or 0
        wordSpacing = options.wordSpacing or 0
        characterSpacing = options.characterSpacing or 0
        
        # text alignments
        if options.width
            lineWidth = wrap.lineWidth - indent - wrap.extraSpace
            
            switch align
                when 'right'
                    x += lineWidth - @widthOfString(text)
                
                when 'center'
                    x += lineWidth / 2 - @widthOfString(text) / 2
                
                when 'justify'
                    # don't justify the last line of paragraphs
                    break if wrap.lastLine
                    
                    # split the line into words
                    words = text.match(WORD_RE)
                    break unless words
                     
                    # calculate the word spacing value                
                    textWidth = @widthOfString text.replace(/\s+/g, '')
                    wordSpacing = (lineWidth - textWidth) / (words.length - 1) - @widthOfString(' ')
                    
        # indentation support
        x += indent
        
        # flip coordinate system
        y = @page.height - y - (@_font.ascender / 1000 * @_fontSize)
        
        # add current font to page if necessary
        @page.fonts[@_font.id] ?= @_font.ref
        
        # tell the font subset to use the characters
        @_font.use text
        
        # encode the text based on the font subset,
        # and then convert it to hex
        text = @_font.encode text
        text = (text.charCodeAt(i).toString(16) for i in [0...text.length]).join('')
        
        # begin the text object
        @addContent "BT"
        
        # text position
        @addContent "#{x} #{y} Td"
        
        # font and font size
        @addContent "/#{@_font.id} #{@_fontSize} Tf"
        
        # rendering mode
        mode = if options.fill and options.stroke then 2 else if options.stroke then 1 else 0
        @addContent "#{mode} Tr" unless mode is state.mode
        
        # Word spacing
        @addContent wordSpacing + ' Tw' unless wordSpacing is state.wordSpacing
        
        # Character spacing
        @addContent characterSpacing + ' Tc' unless characterSpacing is state.characterSpacing
        
        # add the actual text
        @addContent "<#{text}> Tj"
        
        # end the text object
        @addContent "ET"
        
        # keep track of text states
        state.mode = mode
        state.wordSpacing = wordSpacing

    _wrap: (text, options) ->
        wrap = @_wrapState
        width = @widthOfString.bind this
        indent = options.indent or 0
        lineWidth = (options.width - (options.columnGap * (options.columns - 1))) / options.columns
        
        # initial settings
        wrap.column = 1             # the current column
        wrap.startY = @y            # the initial Y position
        wrap.lineWidth = lineWidth  # the maximum width of each line
        wrap.firstLine = true       # whether we are on the first line of a paragraph
        wrap.lastLine = false       # whether we are on the last line of a paragraph
        
        # calculate the maximum Y position the text can appear at
        wrap.maxY = @y + options.height - @currentLineHeight()
        
        # split the line into words
        words = text.match(WORD_RE)
        
        # calculate the extra width
        wrap.extraSpace = (options.wordSpacing or 0) * (words.length - 1) +   # wordSpacing
                          (options.characterSpacing or 0) * (text.length - 1) # characterSpacing
        
        # space left on the line to fill with words
        spaceLeft = lineWidth - indent - wrap.extraSpace
        
        # word width cache
        wordWidths = {}
        len = words.length
        buffer = ''
        
        for word, i in words
            w = wordWidths[word] ?= width(word)
            
            if w > spaceLeft or word is '\n'
                # keep track of the wrapping state
                if wrap.lastLine
                    wrap.firstLine = true
                    wrap.lastLine = false
                
                # if we've got a newline, mark it
                if word is '\n'
                    wrap.lastLine = true
                    w += indent
                
                # render the line
                lastLine = buffer.trim()
                @_line lastLine, options
                
                # we're no longer on the first line...
                wrap.firstLine = false
                
                # if we've reached the maximum height, make sure
                # that the first line of a paragraph is never by 
                # itself at the bottom of a page
                nextY = @y + @currentLineHeight(true)
                if @y > wrap.maxY or (wrap.lastLine and nextY > wrap.maxY)
                    # if we've reached the edge of the page, 
                    # continue on a new page or column
                    @_nextSection options
                
                # reset the space left and buffer
                spaceLeft = lineWidth - w - wrap.extraSpace
                buffer = if word is '\n' then '' else word

            else
                # add the word to the buffer
                spaceLeft -= w
                buffer += word

        # add the last line
        wrap.lastLine = true
        @_line buffer.trim(), options
        
        # reset wrap state
        @_wrapState = {}
        
    _nextSection: (options) ->
        wrap = @_wrapState
        
        if ++wrap.column > options.columns
            @addPage()
            wrap.column = 1
            wrap.startY = @page.margins.top
            wrap.maxY = @page.maxY()
        
        else
            @x += wrap.lineWidth + options.columnGap
            @y = wrap.startY