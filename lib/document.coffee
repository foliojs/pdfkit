###
PDFDocument - represents an entire PDF document
By Devon Govett
###

stream = require 'stream'
PDFObject = require './object'
PDFReference = require './reference'
PDFPage = require './page'

class PDFDocument extends stream.Readable
  constructor: (@options = {}) ->
    super
    # PDF version
    @version = 1.3

    # Whether streams should be compressed
    @compress = @options.compress ? yes

    @_pageBuffer = []
    @_pageBufferStart = 0

    # The PDF object store
    @_offsets = []
    @_waiting = 0
    @_ended = false
    @_offset = 0

    @_root = @ref
      Type: 'Catalog'
      Pages: @ref
        Type: 'Pages'
        Count: 0
        Kids: []

    # The current page
    @page = null

    # Initialize mixins
    @initColor()
    @initVector()
    @initFonts()
    @initText()
    @initImages()

    # Initialize the metadata
    @info =
      Producer: 'PDFKit'
      Creator: 'PDFKit'
      CreationDate: new Date()

    if @options.info
      for key, val of @options.info
        @info[key] = val

    # Write the header
    # PDF version
    @_write "%PDF-#{@version}"

    # 4 binary chars, as recommended by the spec
    @_write "%\xFF\xFF\xFF\xFF"

    # Add the first page
    if @options.autoFirstPage isnt false
      @addPage()

  mixin = (methods) =>
    for name, method of methods
      this::[name] = method

  # Load mixins
  mixin require './mixins/color'
  mixin require './mixins/vector'
  mixin require './mixins/fonts'
  mixin require './mixins/text'
  mixin require './mixins/images'
  mixin require './mixins/annotations'

  addPage: (options = @options) ->
    # end the current page if needed
    @flushPages() unless @options.bufferPages

    # create a page object
    @page = new PDFPage(this, options)
    @_pageBuffer.push(@page)

    # add the page to the object store
    pages = @_root.data.Pages.data
    pages.Kids.push @page.dictionary
    pages.Count++

    # TODO: Remove coordinates
    # reset x and y coordinates
    @x = 0
    @y = 0

    # flip PDF coordinate system so that the origin is in
    # the top left rather than the bottom left
    @_ctm = [1, 0, 0, 1, 0, 0]
    @transform 1, 0, 0, -1, 0, @page.height

    @emit('pageAdded')

    return this

  flushPages: ->
    # this local variable exists so we're future-proof against
    # reentrant calls to flushPages.
    pages = @_pageBuffer
    @_pageBuffer = []
    @_pageBufferStart += pages.length
    for page in pages
      page.end()

    return

  ref: (data) ->
    ref = new PDFReference(this, @_offsets.length + 1, data)
    @_offsets.push null # placeholder for this object's offset once it is finalized
    @_waiting++
    return ref

  _read: ->
      # do nothing, but this method is required by node

  _write: (data) ->
    unless Buffer.isBuffer(data)
      data = new Buffer(data + '\n', 'binary')

    @push data
    @_offset += data.length

  addContent: (data) ->
    @page.write data
    return this

  _refEnd: (ref) ->
    @_offsets[ref.id - 1] = ref.offset
    if --@_waiting is 0 and @_ended
      @_finalize()
      @_ended = false

  end: ->
    @flushPages()
    @_info = @ref()
    for key, val of @info
      if typeof val is 'string'
        val = new String val

      @_info.data[key] = val

    @_info.end()

    for name, font of @_fontFamilies
      font.finalize()

    @_root.end()
    @_root.data.Pages.end()

    if @_waiting is 0
      @_finalize()
    else
      @_ended = true

  _finalize: (fn) ->
    # generate xref
    xRefOffset = @_offset
    @_write "xref"
    @_write "0 #{@_offsets.length + 1}"
    @_write "0000000000 65535 f "

    for offset in @_offsets
      offset = ('0000000000' + offset).slice(-10)
      @_write offset + ' 00000 n '

    # trailer
    @_write 'trailer'
    @_write PDFObject.convert
      Size: @_offsets.length + 1
      Root: @_root
      Info: @_info

    @_write 'startxref'
    @_write "#{xRefOffset}"
    @_write '%%EOF'

    # end the stream
    @push null

  toString: ->
    "[object PDFDocument]"

module.exports = PDFDocument
