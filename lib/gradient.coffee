class PDFGradient
    constructor: (@doc) ->
        @stops = []
        @embedded = no
        @transform = [1, 0, 0, 1, 0, 0]
        
    stop: (pos, color, opacity = 1) ->
        opacity = Math.max(0, Math.min(1, opacity))
        @stops.push [pos, @doc._normalizeColor(color), opacity]
        return this
        
    embed: ->
        return if @embedded or @stops.length is 0
        @embedded = yes
        
        # if the last stop comes before 100%, add a copy at 100%
        last = @stops[@stops.length - 1]
        if last[0] < 1
            @stops.push [1, last[1], last[2]]
        
        bounds = []
        encode = []
        stops = []
        
        for i in [0...@stops.length - 1]
            encode.push 0, 1
            unless i + 2 is @stops.length
                bounds.push @stops[i + 1][0]
            
            fn = @doc.ref
                FunctionType: 2
                Domain: [0, 1]
                C0: @stops[i + 0][1]
                C1: @stops[i + 1][1]
                N: 1
                
            stops.push fn
        
        # if there are only two stops, we don't need a stitching function
        if stops.length is 1
            fn = stops[0]
        else
            fn = @doc.ref
                FunctionType: 3 # stitching function
                Domain: [0, 1]
                Functions: stops
                Bounds: bounds
                Encode: encode
                
        @id = 'Sh' + (++@doc._gradCount)
        
        # apply gradient transform to existing document ctm
        m = @doc._ctm.slice()
        [m0, m1, m2, m3, m4, m5] = m
        [m11, m12, m21, m22, dx, dy] = @transform
        m[0] = m0 * m11 + m2 * m12
        m[1] = m1 * m11 + m3 * m12
        m[2] = m0 * m21 + m2 * m22
        m[3] = m1 * m21 + m3 * m22
        m[4] = m0 * dx + m2 * dy + m4
        m[5] = m1 * dx + m3 * dy + m5

        pattern = @doc.ref
            Type: 'Pattern'
            PatternType: 2
            Shading: @shader fn
            Matrix: (+v.toFixed(5) for v in m)

        @doc.page.patterns[@id] = pattern
        
        if (@stops.some (stop) -> stop[2] < 1)
            grad = @opacityGradient()
            for stop in @stops
                grad.stop stop[0], [stop[2]]
                
            grad = grad.embed()
            grad.data.Shading.data.ColorSpace = 'DeviceGray'
                            
            group = @doc.ref
                Type: 'Group'
                S: 'Transparency'
                CS: 'DeviceGray'
            
            form = @doc.ref
                Type: 'XObject'
                Subtype: 'Form'
                FormType: 1
                BBox: [0, 0, @doc.page.width, @doc.page.height]
                Group: group
                Resources: @doc.ref
                    ProcSet: ['PDF', 'Text', 'ImageB', 'ImageC', 'ImageI']
                    Shading:
                        Sh1: grad.data.Shading
            
            form.add "/Sh1 sh"
            
            sMask = @doc.ref
                Type: 'Mask'
                S: 'Luminosity'
                G: form
                
            gstate = @doc.ref
                Type: 'ExtGState'
                SMask: sMask
            
            @opacity_id = ++@doc._opacityCount
            name = "Gs#{@opacity_id}"
            
            @doc.page.ext_gstates[name] = gstate
        
        return pattern
            
    apply: (op) ->
        @embed() unless @embedded
        @doc.addContent "/#{@id} #{op}"
        
        if @opacity_id
            @doc.save()
            @doc.addContent "/Gs#{@opacity_id} gs"
            @doc._sMasked = true
        
class PDFLinearGradient extends PDFGradient
    constructor: (@doc, @x1, @y1, @x2, @y2) ->
        super
        
    shader: (fn) ->
        @doc.ref
            ShadingType: 2
            ColorSpace: 'DeviceRGB'
            Coords: [@x1, @y1, @x2, @y2]
            Function: fn
            Extend: [true, true]
            
    opacityGradient: ->
        return new PDFLinearGradient(@doc, @x1, @y1, @x2, @y2)
        
class PDFRadialGradient extends PDFGradient
    constructor: (@doc, @x1, @y1, @r1, @x2, @y2, @r2) ->
        super
        
    shader: (fn) ->
        @doc.ref
            ShadingType: 3
            ColorSpace: 'DeviceRGB'
            Coords: [@x1, @y1, @r1, @x2, @y2, @r2]
            Function: fn
            Extend: [true, true]
            
    opacityGradient: ->
        return new PDFRadialGradient(@doc, @x1, @y1, @r1, @x2, @y2, @r2)
            
module.exports = {PDFGradient, PDFLinearGradient, PDFRadialGradient}