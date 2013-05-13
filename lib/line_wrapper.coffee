# This regular expression is used for splitting a string into wrappable words
WORD_RE = /([^ ,\/!.?:;\-\n]+[ ,\/!.?:;\-]*)|\n/g
{EventEmitter} = require 'events'

class LineWrapper extends EventEmitter
    constructor: (@document) ->
        @on 'firstLine', (options) =>
            indent = options.indent or 0
            @document.x += indent
            options.lineWidth -= indent
            
            @once 'line', =>
                @document.x -= indent
                options.lineWidth += indent
        
        @on 'lastLine', (options) =>
            align = options.align
            options.align = 'left' if align is 'justify'
            
            @once 'line', =>
                @document.y += options.paragraphGap or 0
                options.align = align
        
    wrap: (paragraphs, options) ->
        width = @document.widthOfString.bind(@document)
        indent = options.indent or 0
        charSpacing = options.characterSpacing or 0
        wordSpacing = options.wordSpacing is 0
        @columns = options.columns or 1
        @columnGap = options.columnGap ? 18 # 1/4 inch
        @lineWidth =  (options.width - (@columnGap * (@columns - 1))) / @columns
        @startY = @document.y
        @column = 1
        
        # calculate the maximum Y position the text can appear at
        @maxY = @startY + options.height - @document.currentLineHeight()
        
        # make sure we're actually on the page 
        # and that the first line of is never by 
        # itself at the bottom of a page (orphans)
        nextY = @document.y + @document.currentLineHeight(true)
        if @document.y > @maxY or nextY > @maxY
            @nextSection()
        
        # word width cache
        wordWidths = {}
        
        @emit 'sectionStart', options, this
        
        for text, i in paragraphs
            @emit 'firstLine', options, this
            
            # split the line into words
            words = text.match(WORD_RE) or [text]
                          
            # space left on the line to fill with words
            spaceLeft = @lineWidth - indent
            options.lineWidth = spaceLeft
            
            len = words.length
            buffer = ''
            wc = 0
            
            for word, wi in words
                w = wordWidths[word] ?= width(word, options) + charSpacing + wordSpacing

                if w > spaceLeft
                    options.textWidth = width(buffer.trim(), options) + wordSpacing * (wc - 1)
                    @emit 'line', buffer.trim(), options, this
                                        
                    # if we've reached the edge of the page, 
                    # continue on a new page or column
                    if @document.y > @maxY
                        @nextSection()
                            
                    # reset the space left and buffer
                    spaceLeft = @lineWidth - w
                    buffer = if word is '\n' then '' else word
                    wc = 1
                            
                else
                    # add the word to the buffer
                    spaceLeft -= w
                    buffer += word
                    wc++
                        
            # add the last line
            @lastLine = true
            @emit 'lastLine', options, this
            options.textWidth = width(buffer.trim(), options) + wordSpacing * (wc - 1)
            @emit 'line', buffer.trim(), options, this
            
            # make sure that the first line of a paragraph is never by 
            # itself at the bottom of a page (orphans)
            nextY = @document.y + @document.currentLineHeight(true)
            if i < paragraphs.length - 1 and nextY > @maxY
                @nextSection()
                
        @emit 'sectionEnd', options, this
                    
    nextSection: (options) ->
        @emit 'sectionEnd', options, this
        
        if ++@column > @columns
            @document.addPage()
            @column = 1
            @startY = @document.page.margins.top
            @maxY = @document.page.maxY()
            @emit 'pageBreak', options, this
            
        else
            @document.x += @lineWidth + @columnGap
            @document.y = @startY
            @emit 'columnBreak', options, this
        
        @emit 'sectionStart', options, this
            
module.exports = LineWrapper