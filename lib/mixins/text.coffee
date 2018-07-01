{number} = require '../object'

module.exports =
  initText: ->
    # Current coordinates
    @x = 0
    @y = 0
    @_lineGap = 0

  _addGlyphs: (glyphs, positions, x, y, options = {}) ->
    # add current font to page if necessary
    @page.fonts[@_font.id] ?= @_font.ref()

    # Adjust y to match coordinate flipping
    y = @page.height - y

    scale = (1000 / @_fontSize)
    unitsPerEm = @_font.font.unitsPerEm || 1000
    advanceWidthScale = (1000 / unitsPerEm)

    # Glyph encoding and positioning
    encodedGlyphs = @_font.encodeGlyphs(glyphs)
    encodedPositions = positions.map((pos, i) ->
      {
        xAdvance: pos.xAdvance * scale,
        yAdvance: pos.yAdvance * scale,
        xOffset: pos.xOffset,
        yOffset: pos.yOffset,
        advanceWidth: glyphs[i].advanceWidth * advanceWidthScale
      }
    )

    @_glyphs(encodedGlyphs, encodedPositions, x, y, options)

  _glyphs: (encoded, positions, x, y, options) ->
    # flip coordinate system
    @save()
    @transform 1, 0, 0, -1, 0, @page.height

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
    @addContent "#{number(options.characterSpacing)} Tc" if options.characterSpacing

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
