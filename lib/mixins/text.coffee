LineWrapper = require '../line_wrapper'
{number} = require '../object'

module.exports =
  initText: ->
    # Current coordinates
    @x = 0
    @y = 0
    @_lineGap = 0

  lineGap: (@_lineGap) ->
    return this

  moveDown: (lines = 1) ->
    @y += @currentLineHeight(true) * lines + @_lineGap
    return this

  moveUp: (lines = 1) ->
    @y -= @currentLineHeight(true) * lines + @_lineGap
    return this

  _text: (text, x, y, options, lineCallback) ->
    options = @_initOptions(x, y, options)

    # Convert text to a string
    text = '' + text

    # if the wordSpacing option is specified, remove multiple consecutive spaces
    if options.wordSpacing
      text = text.replace(/\s{2,}/g, ' ')

    # word wrapping
    if options.width
      wrapper = @_wrapper
      unless wrapper
        wrapper = new LineWrapper(this, options)
        wrapper.on 'line', lineCallback

      @_wrapper = if options.continued then wrapper else null
      @_textOptions = if options.continued then options else null
      wrapper.wrap text, options

    # render paragraphs as single lines
    else
      lineCallback line, options for line in text.split '\n'

    return this

  text: (text, x, y, options) ->
    @_text text, x, y, options, @_line.bind(this)

  widthOfString: (string, options = {}) ->
    @_font.widthOfString(string, @_fontSize, options.features) + (options.characterSpacing or 0) * (string.length - 1)

  heightOfString: (text, options = {}) ->
    {x,y} = this

    options = @_initOptions(options)
    options.height = Infinity # don't break pages

    lineGap = options.lineGap or @_lineGap or 0
    @_text text, @x, @y, options, (line, options) =>
      @y += @currentLineHeight(true) + lineGap

    height = @y - y
    @x = x
    @y = y

    return height

  list: (list, x, y, options, wrapper) ->
    options = @_initOptions(x, y, options)

    midLine = Math.round (@_font.ascender / 1000 * @_fontSize) / 2
    r = options.bulletRadius or Math.round (@_font.ascender / 1000 * @_fontSize) / 3
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

    wrapper = new LineWrapper(this, options)
    wrapper.on 'line', @_line.bind(this)

    level = 1
    i = 0
    wrapper.on 'firstLine', =>
      if (l = levels[i++]) isnt level
        diff = itemIndent * (l - level)
        @x += diff
        wrapper.lineWidth -= diff
        level = l

      @circle @x - indent + r, @y + midLine, r
      @fill()

    wrapper.on 'sectionStart', =>
      pos = indent + itemIndent * (level - 1)
      @x += pos
      wrapper.lineWidth -= pos

    wrapper.on 'sectionEnd', =>
      pos = indent + itemIndent * (level - 1)
      @x -= pos
      wrapper.lineWidth += pos

    wrapper.wrap items.join('\n'), options

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

    # extend options with previous values for continued text
    if @_textOptions
      for key, val of @_textOptions when key isnt 'continued'
        options[key] ?= val

    # Update the current position
    if x?
      @x = x
    if y?
      @y = y

    # wrap to margins if no x or y position passed
    unless options.lineBreak is false
      margins = @page.margins
      options.width ?= @page.width - @x - margins.right

    options.columns ||= 0
    options.columnGap ?= 18 # 1/4 inch

    return options

  _line: (text, options = {}, wrapper) ->
    @_fragment text, @x, @y, options
    lineGap = options.lineGap or @_lineGap or 0

    if not wrapper
      @x += @widthOfString text
    else
      @y += @currentLineHeight(true) + lineGap

  _fragment: (text, x, y, options) ->
    text = ('' + text).replace(/\n/g, '')
    return if text.length is 0

    # handle options
    align = options.align or 'left'
    wordSpacing = options.wordSpacing or 0
    characterSpacing = options.characterSpacing or 0

    # text alignments
    if options.width
      switch align
        when 'right'
          textWidth = @widthOfString text.replace(/\s+$/, ''), options
          x += options.lineWidth - textWidth

        when 'center'
          x += options.lineWidth / 2 - options.textWidth / 2

        when 'justify'
          # calculate the word spacing value
          words = text.trim().split(/\s+/)
          textWidth = @widthOfString(text.replace(/\s+/g, ''), options)
          spaceWidth = @widthOfString(' ') + characterSpacing
          wordSpacing = Math.max 0, (options.lineWidth - textWidth) / Math.max(1, words.length - 1) - spaceWidth

    # calculate the actual rendered width of the string after word and character spacing
    renderedWidth = options.textWidth + (wordSpacing * (options.wordCount - 1)) + (characterSpacing * (text.length - 1))

    # create link annotations if the link option is given
    if options.link
      @link x, y, renderedWidth, @currentLineHeight(), options.link

    # create underline or strikethrough line
    if options.underline or options.strike
      @save()
      @strokeColor @_fillColor... unless options.stroke

      lineWidth = if @_fontSize < 10 then 0.5 else Math.floor(@_fontSize / 10)
      @lineWidth lineWidth

      d = if options.underline then 1 else 2
      lineY = y + @currentLineHeight() / d
      lineY -= lineWidth if options.underline

      @moveTo x, lineY
      @lineTo x + renderedWidth, lineY
      @stroke()
      @restore()

    # flip coordinate system
    @save()
    @transform 1, 0, 0, -1, 0, @page.height
    y = @page.height - y - (@_font.ascender / 1000 * @_fontSize)

    # add current font to page if necessary
    @page.fonts[@_font.id] ?= @_font.ref()

    # begin the text object
    @addContent "BT"

    # text position
    @addContent "1 0 0 1 #{number(x)} #{number(y)} Tm"

    # font and font size
    @addContent "/#{@_font.id} #{number(@_fontSize)} Tf"

    # rendering mode
    mode = if options.fill and options.stroke then 2 else if options.stroke then 1 else 0
    @addContent "#{mode} Tr" if mode

    # Character spacing
    @addContent "#{number(characterSpacing)} Tc" if characterSpacing

    # Add the actual text
    # If we have a word spacing value, we need to encode each word separately
    # since the normal Tw operator only works on character code 32, which isn't
    # used for embedded fonts.
    if wordSpacing
      words = text.trim().split(/\s+/)
      wordSpacing += @widthOfString(' ') + characterSpacing
      wordSpacing *= 1000 / @_fontSize

      encoded = []
      positions = []
      for word in words
        [encodedWord, positionsWord] = @_font.encode(word, options.features)
        encoded.push encodedWord...
        positions.push positionsWord...

        # add the word spacing to the end of the word
        positions[positions.length - 1].xAdvance += wordSpacing
    else
      [encoded, positions] = @_font.encode(text, options.features)

    scale = @_fontSize / 1000
    commands = []
    last = 0
    hadOffset = no

    # Adds a segment of text to the TJ command buffer
    addSegment = (cur) =>
      if last < cur
        hex = encoded.slice(last, cur).join ''
        advance = positions[cur - 1].xAdvance - positions[cur - 1].advanceWidth
        commands.push "<#{hex}> #{number(-advance)}"

      last = cur

    # Flushes the current TJ commands to the output stream
    flush = (i) =>
      addSegment i

      if commands.length > 0
        @addContent "[#{commands.join ' '}] TJ"
        commands.length = 0

    for pos, i in positions
      # If we have an x or y offset, we have to break out of the current TJ command
      # so we can move the text position.
      if pos.xOffset or pos.yOffset
        # Flush the current buffer
        flush i

        # Move the text position and flush just the current character
        @addContent "1 0 0 1 #{number(x + pos.xOffset * scale)} #{number(y + pos.yOffset * scale)} Tm"
        flush i + 1

        hadOffset = yes
      else
        # If the last character had an offset, reset the text position
        if hadOffset
          @addContent "1 0 0 1 #{number(x)} #{number(y)} Tm"
          hadOffset = no

        # Group segments that don't have any advance adjustments
        unless pos.xAdvance - pos.advanceWidth is 0
          addSegment i + 1

      x += pos.xAdvance * scale

    # Flush any remaining commands
    flush i

    # end the text object
    @addContent "ET"

    # restore flipped coordinate system
    @restore()
