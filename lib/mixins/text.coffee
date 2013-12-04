WORD_RE = /([^ ,\/!.?:;\-\n]*[ ,\/!.?:;\-]*)|\n/g
LineWrapper = require '../line_wrapper'

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
            link: 0
        
    lineGap: (@_lineGap) ->
        return this
        
    moveDown: (lines = 1) ->
        @y += @currentLineHeight(true) * lines + @_lineGap
        return this

    moveUp: (lines = 1) ->
        @y -= @currentLineHeight(true) * lines + @_lineGap
        return this
        
    text: (text, x, y, options) ->
        options = @_initOptions(x, y, options)
        
        # Convert text to a string
        text = '' + text
                    
        # if the wordSpacing option is specified, remove multiple consecutive spaces
        if options.wordSpacing
            text = text.replace(/\s{2,}/g, ' ')
        
        if options.parseLinks
            # extract/store markdown style links to be injected as annotations later
            linkPattern = /\[(.*?)\]\((.*?)\)/g
            if linkPattern.test text
                options.links = text.match linkPattern

                # remove url portion from text and wrap with vertical ellipses
                # vertical ellipses are used to prevent accidentally matching the same text in the wrong place
                # and because they *mostly* have an undefined character width which causes the wrapper to ignore them
                text = text.replace linkPattern, '⋮$1⋮'

        paragraphs = text.split '\n'
        
        # word wrapping
        if options.width
            wrapper = new LineWrapper(this)
            wrapper.on 'line', @_line.bind(this)
            wrapper.wrap(paragraphs, options)
            
        # render paragraphs as single lines
        else
            @_line line, options for line in paragraphs
        
        return this
        
    list: (list, x, y, options, wrapper) ->
        options = @_initOptions(x, y, options)
        
        r = Math.round (@_font.ascender / 1000 * @_fontSize) / 3
        indent = options.textIndent or r * 5
        itemIndent = options.bulletIndent or r * 8
        
        level = 1
        items = []
        levels = []
        
        flatten = (list) ->
            for item, i in list
                if Array.isArray(item)
                    level++
                    flatten(item)
                    level--
                else
                    items.push(item)
                    levels.push(level)
                    
        flatten(list)
                
        wrapper = new LineWrapper(this)
        wrapper.on 'line', @_line.bind(this)
        
        level = 1
        i = 0
        wrapper.on 'firstLine', =>
            if (l = levels[i++]) isnt level
                diff = itemIndent * (l - level)
                @x += diff
                wrapper.lineWidth -= diff
                level = l
                
            @circle @x - indent + r, @y + r + (r / 2), r
            @fill()
                
        wrapper.on 'sectionStart', =>
            pos = indent + itemIndent * (level - 1)
            @x += pos
            wrapper.lineWidth -= pos
            
        wrapper.on 'sectionEnd', =>
            pos = indent + itemIndent * (level - 1)
            @x -= pos
            wrapper.lineWidth += pos
                    
        wrapper.wrap(items, options)
        
        @x -= indent
        return this
        
    _initOptions: (x = {}, y, options = {}) ->
        if typeof x is 'object'
            options = x
            x = null

        # clone options object
        options = do ->
            opts = {}
            opts[k] = v for k, v of options
            return opts

        # Update the current position
        if x? or y?
            @x = x or @x
            @y = y or @y

        # wrap to margins if no x or y position passed
        unless options.lineBreak is false
            margins = @page.margins
            options.width ?= @page.width - @x - margins.right
            options.height ?= @page.height - @y - margins.bottom

        options.columns ||= 0
        options.columnGap ?= 18 # 1/4 inch

        options.parseLinks ||= false

        return options
    
    widthOfString: (string, options = {}) ->
        @_font.widthOfString(string, @_fontSize) + (options.characterSpacing or 0) * (string.length - 1)
        
    _line: (text, options = {}, wrapper) ->
        @_fragment text, @x, @y, options
        lineGap = options.lineGap or @_lineGap or 0
        
        if not wrapper or (wrapper.lastLine and options.lineBreak is no)
            @x += @widthOfString text
        else
            @y += @currentLineHeight(true) + lineGap

    _fragment: (text, x, y, options) ->
        text = '' + text
        return if text.length is 0

        state = @_textState

        # handle options
        align = options.align or 'left'
        wordSpacing = options.wordSpacing or 0
        characterSpacing = options.characterSpacing or 0

        # text alignments
        if options.width
            switch align
                when 'right'
                    x += options.lineWidth - options.textWidth

                when 'center'
                    x += options.lineWidth / 2 - options.textWidth / 2

                when 'justify'
                    # split the line into words
                    words = text.match(WORD_RE) or [text]
                    break unless words

                    # calculate the word spacing value  
                    textWidth = @widthOfString(text.replace(/\s+/g, ''), options)
                    spaceWidth = @widthOfString(' ') + characterSpacing
                    wordSpacing = (options.lineWidth - textWidth) / (words.length - 1) - spaceWidth

        # look for the next link and annotate (if they haven't all been found)
        if options.links and state.link < options.links.length
            [match, linkLabel, linkUrl] = options.links[state.link].match /\[(.*?)\]\((.*?)\)/

            # if found then remove from text and update state to search for next link
            linkIndex = text.indexOf '⋮' + linkLabel + '⋮'
            if !!~ linkIndex
                text = text.replace '⋮' + linkLabel + '⋮', linkLabel
                state.link = state.link + 1

                # let pdf viewer handle emails
                if linkUrl.indexOf 'mailto:' isnt 0
                    # add annotation at the point where link starts
                    linkX = x + @widthOfString(text.substr 0, linkIndex)
                    @link linkX, y, @widthOfString(linkLabel), @currentLineHeight(true), linkUrl

        # manually add link (if option is set)
        if options.link
            @link x, y, @widthOfString(text), @currentLineHeight(true), options.link

        # flip coordinate system
        @save()
        @transform 1, 0, 0, -1, 0, @page.height
        y = @page.height - y - (@_font.ascender / 1000 * @_fontSize)

        # add current font to page if necessary
        @page.fonts[@_font.id] ?= @_font.ref

        # tell the font subset to use the characters
        @_font.use(text)

        # encode the text based on the font subset,
        # and then convert it to hex
        text = @_font.encode(text)
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
        
        # restore flipped coordinate system
        @restore()

        # keep track of text states
        state.mode = mode
        state.wordSpacing = wordSpacing