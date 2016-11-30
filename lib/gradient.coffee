class PDFGradient
  constructor: (@doc) ->
    @stops = []
    @embedded = no
    @transform = [1, 0, 0, 1, 0, 0]
    @_colorSpace = 'DeviceRGB'
    
  stop: (pos, color, opacity = 1) ->
    opacity = Math.max(0, Math.min(1, opacity))
    @stops.push [pos, @doc._normalizeColor(color), opacity]
    return this
    
  setTransform: (m11, m12, m21, m22, dx, dy) ->
    @transform = [m11, m12, m21, m22, dx, dy]
    return this

  embed: (m) ->
    return if @stops.length is 0
    @embedded = yes
    @matrix = m
    
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
      fn.end()
    
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
        
      fn.end()
        
    @id = 'Sh' + (++@doc._gradCount)
    
    shader = @shader fn
    shader.end()
    
    pattern = @doc.ref
      Type: 'Pattern'
      PatternType: 2
      Shading: shader
      Matrix: (+v.toFixed(5) for v in @matrix)

    pattern.end()
    
    if (@stops.some (stop) -> stop[2] < 1)
      grad = @opacityGradient()
      grad._colorSpace = 'DeviceGray'
      
      for stop in @stops
        grad.stop stop[0], [stop[2]]
        
      grad = grad.embed(@matrix)
      
      pageBBox = [0, 0, @doc.page.width, @doc.page.height]
      
      form = @doc.ref
        Type: 'XObject'
        Subtype: 'Form'
        FormType: 1
        BBox: pageBBox
        Group:
          Type: 'Group'
          S: 'Transparency'
          CS: 'DeviceGray'
        Resources:
          ProcSet: ['PDF', 'Text', 'ImageB', 'ImageC', 'ImageI']
          Pattern:
            Sh1: grad
      
      form.write "/Pattern cs /Sh1 scn"
      form.end "#{pageBBox.join(" ")} re f"
      
      gstate = @doc.ref
        Type: 'ExtGState'
        SMask:
          Type: 'Mask'
          S: 'Luminosity'
          G: form
      
      gstate.end()
      
      opacityPattern = @doc.ref
        Type: 'Pattern'
        PatternType: 1
        PaintType: 1
        TilingType: 2
        BBox: pageBBox
        XStep: pageBBox[2]
        YStep: pageBBox[3]
        Resources:
          ProcSet: ['PDF', 'Text', 'ImageB', 'ImageC', 'ImageI']
          Pattern:
            Sh1: pattern
          ExtGState:
            Gs1: gstate
      
      opacityPattern.write "/Gs1 gs /Pattern cs /Sh1 scn"
      opacityPattern.end "#{pageBBox.join(" ")} re f"
      
      @doc.page.patterns[@id] = opacityPattern
      
    else
      @doc.page.patterns[@id] = pattern
      
    return pattern

  apply: (op) ->
    # apply gradient transform to existing document ctm
    [m0, m1, m2, m3, m4, m5] = @doc._ctm.slice()
    [m11, m12, m21, m22, dx, dy] = @transform
    m = [m0 * m11 + m2 * m12,
         m1 * m11 + m3 * m12,
         m0 * m21 + m2 * m22,
         m1 * m21 + m3 * m22,
         m0 * dx + m2 * dy + m4,
         m1 * dx + m3 * dy + m5]

    @embed(m) unless @embedded and m.join(" ") is @matrix.join(" ")
    @doc.addContent "/#{@id} #{op}"

class PDFLinearGradient extends PDFGradient
  constructor: (@doc, @x1, @y1, @x2, @y2) ->
    super
    
  shader: (fn) ->
    @doc.ref
      ShadingType: 2
      ColorSpace: @_colorSpace
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
      ColorSpace: @_colorSpace
      Coords: [@x1, @y1, @r1, @x2, @y2, @r2]
      Function: fn
      Extend: [true, true]
      
  opacityGradient: ->
    return new PDFRadialGradient(@doc, @x1, @y1, @r1, @x2, @y2, @r2)
      
module.exports = {PDFGradient, PDFLinearGradient, PDFRadialGradient}
