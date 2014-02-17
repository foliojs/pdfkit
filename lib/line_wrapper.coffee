{EventEmitter} = require 'events'
LineBreaker = require 'linebreak'

class LineWrapper extends EventEmitter
    constructor: (@document, options) ->
        @indent      = options.indent or 0
        @charSpacing = options.characterSpacing or 0
        @wordSpacing = options.wordSpacing is 0
        @columns     = options.columns or 1
        @columnGap   = options.columnGap ? 18 # 1/4 inch
        @lineWidth   = (options.width - (@columnGap * (@columns - 1))) / @columns
        @startX      = @document.x
        @startY      = @document.y
        @column      = 1
        
        # calculate the maximum Y position the text can appear at
        @maxY = @startY + options.height
        
        # handle paragraph indents
        @on 'firstLine', (options) =>
            # if this is the first line of the text segment, and
            # we're continuing where we left off, indent that much
            # otherwise use the user specified indent option
            indent = @continuedX ? @indent
            @document.x += indent
            @lineWidth -= indent
            
            @once 'line', =>
                @document.x -= indent
                @lineWidth += indent
                @continuedX = null
        
        # handle left aligning last lines of paragraphs
        @on 'lastLine', (options) =>
            align = options.align
            options.align = 'left' if align is 'justify'
            @lastLine = true
            
            @once 'line', =>
                @document.y += options.paragraphGap or 0
                options.align = align
                @lastLine = false
                
    wordWidth: (word) ->
        return @document.widthOfString(word, this) + @charSpacing + @wordSpacing
                
    eachWord: (text, fn) ->
        # setup a unicode line breaker
        breaker = new LineBreaker(text)
        last = null
        wordWidths = {}
        
        while bk = breaker.nextBreak()
            word = text.slice(last?.position or 0, bk.position)
            w = wordWidths[word] ?= @wordWidth word
            
            # if the word is longer than the whole line, chop it up
            if w > @lineWidth
                # make some fake break objects
                lbk = last
                fbk = {}
                
                while word.length
                    # fit as much of the word as possible into the space we have
                    l = word.length
                    while w > @spaceLeft
                        w = @wordWidth word.slice(0, --l)
                        
                    # send a required break unless this is the last piece
                    fbk.required = l < word.length
                    fn word.slice(0, l), w, fbk, lbk
                    lbk = required: false
                    
                    # get the remaining piece of the word
                    word = word.slice(l)
                    w = @wordWidth word
            else
                # otherwise just emit the break as it was given to us
                fn word, w, bk, last
                
            last = bk
            
        return
        
    wrap: (text, options) ->
        # override options from previous continued fragments
        @indent      = options.indent           if options.indent?
        @charSpacing = options.characterSpacing if options.characterSpacing?
        @wordSpacing = options.wordSpacing      if options.wordSpacing?
        
        # make sure we're actually on the page 
        # and that the first line of is never by 
        # itself at the bottom of a page (orphans)
        nextY = @document.y + @document.currentLineHeight(true)
        if @document.y > @maxY or nextY > @maxY
            @nextSection()
                
        buffer = ''
        textWidth = 0
        wc = 0
        
        y = @document.y # used to reset Y pos if options.continued (below)
        emitLine = =>
            options.textWidth = textWidth + @wordSpacing * (wc - 1)
            options.wordCount = wc
            options.lineWidth = @lineWidth
            y = @document.y
            @emit 'line', buffer, options, this
            
        @emit 'sectionStart', options, this
        
        @eachWord text, (word, w, bk, last) =>
            if not last? or last.required
                @emit 'firstLine', options, this
                @spaceLeft = @lineWidth
            
            if w <= @spaceLeft
                buffer += word
                textWidth += w
                wc++
                            
            if bk.required or w > @spaceLeft
                if bk.required
                    @emit 'lastLine', options, this
                
                emitLine()
                
                # if we've reached the edge of the page, 
                # continue on a new page or column
                if @document.y + @document.currentLineHeight(true) > @maxY
                    @nextSection()
                
                # reset the space left and buffer
                if bk.required
                    @spaceLeft = @lineWidth
                    buffer = ''
                    textWidth = 0
                    wc = 0
                else
                    # reset the space left and buffer
                    @spaceLeft = @lineWidth - w
                    buffer = word
                    textWidth = w
                    wc = 1
            else
                @spaceLeft -= w
            
        if wc > 0
            @emit 'lastLine', options, this
            emitLine()
                
        @emit 'sectionEnd', options, this
        
        # if the wrap is set to be continued, save the X position
        # to start the first line of the next segment at, and reset
        # the y position
        if options.continued is yes
            @continuedX = textWidth
            @document.y = y
        else
            @document.x = @startX
                    
    nextSection: (options) ->
        @emit 'sectionEnd', options, this
        
        if ++@column > @columns
            @document.addPage()
            @column = 1
            @startY = @document.page.margins.top
            @maxY = @document.page.maxY()
            @document.x = @startX
            @document.fillColor @document._fillColor... if @document._fillColor
            @emit 'pageBreak', options, this
            
        else
            @document.x += @lineWidth + @columnGap
            @document.y = @startY
            @emit 'columnBreak', options, this
        
        @emit 'sectionStart', options, this
            
module.exports = LineWrapper
