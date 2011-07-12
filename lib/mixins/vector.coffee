SVGPath = require '../path'

# This constant is used to approximate a symmetrical arc using a cubic
# Bezier curve.
KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0)
module.exports =
    save: ->
        @addContent 'q'
        
    restore: ->
        @addContent 'Q'
        
    beginPath: ->
        @addContent 'm'
        
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
        @addContent "[null null] 0 d"
        
    moveTo: (x, y) ->
        y = @page.height - y
        @addContent "#{x} #{y} m"

    lineTo: (x, y) ->
        y = @page.height - y
        @addContent "#{x} #{y} l"
        
    bezierCurveTo: (cp1x, cp1y, cp2x, cp2y, x, y) ->
        cp1y = @page.height - cp1y
        cp2y = @page.height - cp2y
        y = @page.height - y
        @addContent "#{cp1x} #{cp1y} #{cp2x} #{cp2y} #{x} #{y} c"
        
    quadraticCurveTo: (cpx, cpy, x, y) ->
        cpy = @page.height - cpy
        y = @page.height - y
        @addContent "#{cpx} #{cpy} #{x} #{y} v"
        
    rect: (x, y, w, h) ->
        y = @page.height - y - h
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
        values = [m11, m12, m21, m22, dx, dy].join ' '
        @addContent "#{values} cm"
        
    translate: (x, y) ->
        @transform 1, 0, 0, 1, x, -y
        
    rotate: (angle, options = {}) ->
        rad = angle * Math.PI / 180
        cos = Math.cos(rad)
        sin = Math.sin(rad)
        x = y = 0

        if options.origin?
            x = options.origin[0]
            y = @page.height - options.origin[1]
            x1 = x * cos - y * sin
            y1 = x * sin + y * cos
            x -= x1
            y -= y1

        @transform cos, sin, -sin, cos, x, y
        
    scale: (factor, options = {}) ->
        x = y = 0
        
        if options.origin?
            x = options.origin[0]
            y = @page.height - options.origin[1]
            x1 = factor * x
            y1 = factor * y
            x -= x1
            y -= y1
            
        @transform factor, 0, 0, factor, x, y