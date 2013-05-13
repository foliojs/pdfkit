SVGPath = require '../path'

# This constant is used to approximate a symmetrical arc using a cubic
# Bezier curve.
KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0)
module.exports =
    initVector: ->
        @_ctm = [1, 0, 0, 1, 0, 0] # current transformation matrix
        @_ctmStack = []
        
    save: ->
        @_ctmStack.push @_ctm.slice()
        # TODO: save/restore colorspace and styles so not setting it unnessesarily all the time?
        @addContent 'q'
        
    restore: ->
        @_ctm = @_ctmStack.pop() or [1, 0, 0, 1, 0, 0]
        @addContent 'Q'
        
    closePath: ->
        @addContent 'h'
    
    lineWidth: (w) ->
        @addContent "#{w} w"
        
    _CAP_STYLES: 
        BUTT: 0
        ROUND: 1
        SQUARE: 2
        
    lineCap: (c) ->
        c = @_CAP_STYLES[c.toUpperCase()] if typeof c is 'string'
        @addContent "#{c} J"
        
    _JOIN_STYLES:
        MITER: 0
        ROUND: 1
        BEVEL: 2
        
    lineJoin: (j) ->
        j = @_JOIN_STYLES[j.toUpperCase()] if typeof j is 'string'
        @addContent "#{j} j"
        
    miterLimit: (m) ->
        @addContent "#{m} M"
        
    dash: (length, options = {}) ->
        return this unless length?
        
        space = options.space or length
        phase = options.phase or 0
        
        @addContent "[#{length} #{space}] #{phase} d"
        
    undash: ->
        @addContent "[] 0 d"
        
    moveTo: (x, y) ->
        @addContent "#{x} #{y} m"

    lineTo: (x, y) ->
        @addContent "#{x} #{y} l"
        
    bezierCurveTo: (cp1x, cp1y, cp2x, cp2y, x, y) ->
        @addContent "#{cp1x} #{cp1y} #{cp2x} #{cp2y} #{x} #{y} c"
        
    quadraticCurveTo: (cpx, cpy, x, y) ->
        @addContent "#{cpx} #{cpy} #{x} #{y} v"
        
    rect: (x, y, w, h) ->
        @addContent "#{x} #{y} #{w} #{h} re"
        
    roundedRect: (x, y, w, h, r = 0) ->
        @moveTo x + r, y
        @lineTo x + w - r, y
        @quadraticCurveTo x + w, y, x + w, y + r
        @lineTo x + w, y + h - r
        @quadraticCurveTo x + w, y + h, x + w - r, y + h
        @lineTo x + r, y + h
        @quadraticCurveTo x, y + h, x, y + h - r
        @lineTo x, y + r
        @quadraticCurveTo x, y, x + r, y
        
    ellipse: (x, y, r1, r2 = r1) ->
        l1 = r1 * KAPPA
        l2 = r2 * KAPPA

        @moveTo x + r1, y
        @bezierCurveTo x + r1, y + l1, x + l2, y + r2, x, y + r2
        @bezierCurveTo x - l2, y + r2, x - r1, y + l1, x - r1, y
        @bezierCurveTo x - r1, y - l1, x - l2, y - r2, x, y - r2
        @bezierCurveTo x + l2, y - r2, x + r1, y - l1, x + r1, y
        @moveTo x, y
        
    circle: (x, y, radius) ->
        @ellipse x, y, radius
        
    polygon: (points...) ->
        @moveTo points.shift()...
        @lineTo point... for point in points
        @closePath()
        
    path: (path) ->
        SVGPath.apply this, path
        return this
        
    _windingRule: (rule) ->
        if /even-?odd/.test(rule)
            return '*'
        
        return ''
        
    fill: (color, rule) ->
        if /(even-?odd)|(non-?zero)/.test(color)
            rule = color
            color = null
        
        @fillColor color if color
        @addContent 'f' + @_windingRule(rule)

    stroke: (color) ->
        @strokeColor color if color
        @addContent 'S'

    fillAndStroke: (fillColor, strokeColor = fillColor, rule) ->
        isFillRule = /(even-?odd)|(non-?zero)/
        if isFillRule.test(fillColor)
            rule = fillColor
            fillColor = null
            
        if isFillRule.test(strokeColor)
            rule = strokeColor
            strokeColor = fillColor
        
        if fillColor
            @fillColor fillColor
            @strokeColor strokeColor
            
        @addContent 'B' + @_windingRule(rule)

    clip: (rule) ->
        @addContent 'W' + @_windingRule(rule) + ' n'
        
    transform: (m11, m12, m21, m22, dx, dy) ->
        # keep track of the current transformation matrix
        m = @_ctm
        [m0, m1, m2, m3, m4, m5] = m
        m[0] = m0 * m11 + m2 * m12
        m[1] = m1 * m11 + m3 * m12
        m[2] = m0 * m21 + m2 * m22
        m[3] = m1 * m21 + m3 * m22
        m[4] = m0 * dx + m2 * dy + m4
        m[5] = m1 * dx + m3 * dy + m5
        
        values = (+v.toFixed(5) for v in [m11, m12, m21, m22, dx, dy]).join(' ')
        @addContent "#{values} cm"
        
    translate: (x, y) ->
        @transform 1, 0, 0, 1, x, y
        
    rotate: (angle, options = {}) ->
        rad = angle * Math.PI / 180
        cos = Math.cos(rad)
        sin = Math.sin(rad)
        x = y = 0

        if options.origin?
            [x, y] = options.origin
            x1 = x * cos - y * sin
            y1 = x * sin + y * cos
            x -= x1
            y -= y1

        @transform cos, sin, -sin, cos, x, y
        
    scale: (xFactor, yFactor = xFactor, options = {}) ->
        if arguments.length is 2
            yFactor = xFactor
            options = yFactor
            
        x = y = 0
        if options.origin?
            [x, y] = options.origin
            x -= xFactor * x
            y -= yFactor * y
        
        @transform xFactor, 0, 0, yFactor, x, y
