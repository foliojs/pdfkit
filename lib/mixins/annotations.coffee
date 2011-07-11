PDFObject = require '../object'

module.exports = 
    annotate: (x, y, w, h, options) ->
        options.Type = 'Annot'
        options.Rect = @_convertRect x, y, w, h
        options.Border = [0, 0, 0]
        options.C ?= @_normalizeColor(options.color or [0, 0, 0]) unless options.Subtype is 'Link' # convert colors
        delete options.color
        
        if typeof options.Dest is 'string'
            options.Dest = PDFObject.s options.Dest
        
        # Capitalize keys    
        for key, val of options
            options[key[0].toUpperCase() + key.slice(1)] = val
            
        @page.annotations.push @ref options
        return this
        
    note: (x, y, w, h, contents, options = {}) ->
        options.Subtype = 'Text'
        options.Contents = PDFObject.s contents
        options.Name = 'Comment'
        options.color ?= [243, 223, 92]
        @annotate x, y, w, h, options
        
    link: (x, y, w, h, url, options = {}) ->
        options.Subtype = 'Link'
        options.A = @ref
            S: 'URI'
            URI: PDFObject.s url
            
        @annotate x, y, w, h, options
        
    _markup: (x, y, w, h, options = {}) ->
        [x1, y1, x2, y2] = @_convertRect x, y, w, h
        options.QuadPoints = [x1, y2, x2, y2, x1, y1, x2, y1]
        options.Contents = PDFObject.s ''
        @annotate x, y, w, h, options
        
    highlight: (x, y, w, h, options = {}) ->
        options.Subtype = 'Highlight'
        options.color ?= [241, 238, 148]
        @_markup x, y, w, h, options
        
    underline: (x, y, w, h, options = {}) ->
        options.Subtype = 'Underline'
        @_markup x, y, w, h, options
        
    strike: (x, y, w, h, options = {}) ->
        options.Subtype = 'StrikeOut'
        @_markup x, y, w, h, options
        
    lineAnnotation: (x1, y1, x2, y2, options = {}) ->
        options.Subtype = 'Line'
        options.Contents = PDFObject.s ''
        options.L = [x1, @page.height - y1, x2, @page.height - y2]
        @annotate x1, y1, x2, y2, options
        
    rectAnnotation: (x, y, w, h, options = {}) ->
        options.Subtype = 'Square'
        options.Contents = PDFObject.s ''
        @annotate x, y, w, h, options
        
    ellipseAnnotation: (x, y, w, h, options = {}) ->
        options.Subtype = 'Circle'
        options.Contents = PDFObject.s ''
        @annotate x, y, w, h, options
        
    textAnnotation: (x, y, w, h, text, options = {}) ->
        options.Subtype = 'FreeText'
        options.Contents = PDFObject.s text
        options.DA = PDFObject.s ''
        @annotate x, y, w, h, options
        
    _convertRect: (rect...) ->
        rect[1] = @page.height - rect[1] - rect[3]
        rect[2] += rect[0]
        rect[3] += rect[1]
        return rect