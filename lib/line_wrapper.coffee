{EventEmitter} = require 'events'
LineBreaker = require 'linebreak'

class LineWrapper extends EventEmitter
  constructor: (@document, options) ->
    @indent    = options.indent or 0
    @characterSpacing = options.characterSpacing or 0
    @wordSpacing = options.wordSpacing is 0
    @columns   = options.columns or 1
    @columnGap   = options.columnGap ? 18 # 1/4 inch
    @lineWidth   = (options.width - (@columnGap * (@columns - 1))) / @columns
    @startX    = @document.x
    @startY    = @document.y
    @column    = 1
    @ellipsis  = options.ellipsis
    @continuedX  = 0
    
    # calculate the maximum Y position the text can appear at
    if options.height?
      @height = options.height
      @maxY = @startY + options.height
    else
      @maxY = @document.page.maxY()
    
    # handle paragraph indents
    @on 'firstLine', (options) =>
      # if this is the first line of the text segment, and
      # we're continuing where we left off, indent that much
      # otherwise use the user specified indent option
      indent = @continuedX or @indent
      @document.x += indent
      @lineWidth -= indent
      
      @once 'line', =>
        @document.x -= indent
        @lineWidth += indent
        if options.continued and not @continuedX
          @continuedX = @indent
        @continuedX = 0 unless options.continued
    
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
    return @document.widthOfString(word, this) + @characterSpacing + @wordSpacing
        
  eachWord: (text, fn) ->
    # setup a unicode line breaker
    breaker = new LineBreaker(text)
    last = null
    wordWidths = {}
    
    while bk = breaker.nextBreak()
      word = text.slice(last?.position or 0, bk.position)
      w = wordWidths[word] ?= @wordWidth word
      
      # if the word is longer than the whole line, chop it up
      # TODO: break by grapheme clusters, not JS string characters
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
          shouldContinue = fn word.slice(0, l), w, fbk, lbk
          lbk = required: false
          
          # get the remaining piece of the word
          word = word.slice(l)
          w = @wordWidth word
          
          break if shouldContinue is no
      else
        # otherwise just emit the break as it was given to us
        shouldContinue = fn word, w, bk, last
        
      break if shouldContinue is no
      last = bk
      
    return
    
  wrap: (text, options) ->
    # override options from previous continued fragments
    @indent    = options.indent       if options.indent?
    @characterSpacing = options.characterSpacing if options.characterSpacing?
    @wordSpacing = options.wordSpacing    if options.wordSpacing?
    @ellipsis  = options.ellipsis     if options.ellipsis?
    
    # make sure we're actually on the page 
    # and that the first line of is never by 
    # itself at the bottom of a page (orphans)
    nextY = @document.y + @document.currentLineHeight(true)
    if @document.y > @maxY or nextY > @maxY
      @nextSection()
        
    buffer = ''
    textWidth = 0
    wc = 0
    lc = 0
    
    y = @document.y # used to reset Y pos if options.continued (below)
    emitLine = =>
      options.textWidth = textWidth + @wordSpacing * (wc - 1)
      options.wordCount = wc
      options.lineWidth = @lineWidth
      y = @document.y
      @emit 'line', buffer, options, this
      lc++
      
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
          
        # if the user specified a max height and an ellipsis, and is about to pass the
        # max height and max columns after the next line, append the ellipsis
        lh = @document.currentLineHeight(true)
        if @height? and @ellipsis and @document.y + lh * 2 > @maxY and @column >= @columns
          @ellipsis = '…' if @ellipsis is true # map default ellipsis character
          buffer = buffer.replace(/\s+$/, '')
          textWidth = @wordWidth buffer + @ellipsis
          
          # remove characters from the buffer until the ellipsis fits
          while textWidth > @lineWidth
            buffer = buffer.slice(0, -1).replace(/\s+$/, '')
            textWidth = @wordWidth buffer + @ellipsis
        
          buffer = buffer + @ellipsis
          
        emitLine()
        
        # if we've reached the edge of the page, 
        # continue on a new page or column
        if @document.y + lh > @maxY
          shouldContinue = @nextSection()
          
          # stop if we reached the maximum height
          unless shouldContinue
            wc = 0
            buffer = ''
            return no
        
        # reset the space left and buffer
        if bk.required
          # if there's a word but no space left, emit single line
          if w > @spaceLeft
            buffer = word
            textWidth = w
            wc = 1
            emitLine()
            
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
      @continuedX = 0 if lc > 1
      @continuedX += options.textWidth
      @document.y = y
    else
      @document.x = @startX
          
  nextSection: (options) ->
    @emit 'sectionEnd', options, this
    
    if ++@column > @columns
      # if a max height was specified by the user, we're done.
      # otherwise, the default is to make a new page at the bottom.
      return false if @height?
               
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
    return true
      
module.exports = LineWrapper
