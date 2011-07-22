###
PDFDocument - represents an entire PDF document
By Devon Govett
###

fs = require 'fs'
PDFObjectStore = require './store'
PDFObject = require './object'
PDFReference = require './reference'
PDFPage = require './page'

class PDFDocument
    constructor: (@options = {}) ->
        # PDF version
        @version = 1.3
        
        # Whether streams should be compressed
        @compress = true
        
        # The PDF object store
        @store = new PDFObjectStore
        
        # A list of pages in this document
        @pages = []
        
        # The current page
        @page = null
        
        # Initialize mixins
        @initColor()
        @initFonts()
        @initText()
        @initImages()
        
        # Create the metadata
        @_info = @ref
            Producer: 'PDFKit'
            Creator: 'PDFKit'
            CreationDate: new Date()
                
        @info = @_info.data
        if @options.info
            @info[key] = val for key, val of @options.info
            delete @options.info
        
        # Add the first page
        @addPage()
    
    mixin = (name) =>
        methods = require './mixins/' + name
        for name, method of methods
            this::[name] = method
    
    # Load mixins
    mixin 'color'
    mixin 'vector'
    mixin 'fonts'
    mixin 'text'
    mixin 'images'
    mixin 'annotations'
        
    addPage: (options = @options) ->
        # create a page object
        @page = new PDFPage(this, options)
        
        # add the page to the object store
        @store.addPage @page
        @pages.push @page
        
        # reset x and y coordinates
        @x = @page.margins.left
        @y = @page.margins.top
        
        return this
        
    ref: (data) ->
        @store.ref(data)
        
    addContent: (str) ->
        @page.content.add str
        return this # make chaining possible
        
    write: (filename, callback) ->
         fs.writeFile filename, @output(), 'binary', callback
        
    output: ->
       out = []
       @finalize()
       @generateHeader out
       @generateBody out
       @generateXRef out
       @generateTrailer out
       return out.join('\n')
        
    finalize: ->
        # convert strings in the info dictionary to literals
        for key, val of @info when typeof val is 'string'
            @info[key] = PDFObject.s val
        
        # embed the subsetted fonts
        for family, font of @_fontFamilies
            font.embed()
        
        # finalize each page
        for page in @pages
            page.finalize()
        
    generateHeader: (out) ->
        # PDF version
        out.push "%PDF-#{@version}"

        # 4 binary chars, as recommended by the spec
        out.push "%\xFF\xFF\xFF\xFF\n"
        return out
        
    generateBody: (out) ->
        offset = out.join('\n').length
        
        for id, ref of @store.objects
            object = ref.object()
            ref.offset = offset
            out.push object
            
            offset += object.length + 1
            
        @xref_offset = offset
        
    generateXRef: (out) ->
        len = @store.length + 1
        out.push "xref"
        out.push "0 #{len}"
        out.push "0000000000 65535 f "

        for id, ref of @store.objects
            offset = ('0000000000' + ref.offset).slice(-10)
            out.push offset + ' 00000 n '
            
    generateTrailer: (out) ->
        trailer = PDFObject.convert
            Size: @store.length
            Root: @store.root
            Info: @_info

        out.push 'trailer'
        out.push trailer
        out.push 'startxref'
        out.push @xref_offset
        out.push '%%EOF'
        
    toString: ->
        "[object PDFDocument]"
        
module.exports = PDFDocument