SVGPath = require '../path'
{number} = require '../object'

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
    @addContent "#{number(w)} w"

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
    @addContent "#{number(m)} M"

  dash: (length, options = {}) ->
    return this unless length?
    if Array.isArray length
      length = (number(v) for v in length).join(' ')
      phase = options.phase or 0
      @addContent "[#{length}] #{number(phase)} d"
    else
      space = options.space ? length
      phase = options.phase or 0
      @addContent "[#{number(length)} #{number(space)}] #{number(phase)} d"

  undash: ->
    @addContent "[] 0 d"

  moveTo: (x, y) ->
    @addContent "#{number(x)} #{number(y)} m"

  lineTo: (x, y) ->
    @addContent "#{number(x)} #{number(y)} l"

  bezierCurveTo: (cp1x, cp1y, cp2x, cp2y, x, y) ->
    @addContent "#{number(cp1x)} #{number(cp1y)} #{number(cp2x)} #{number(cp2y)} #{number(x)} #{number(y)} c"

  quadraticCurveTo: (cpx, cpy, x, y) ->
    @addContent "#{number(cpx)} #{number(cpy)} #{number(x)} #{number(y)} v"

  rect: (x, y, w, h) ->
    @addContent "#{number(x)} #{number(y)} #{number(w)} #{number(h)} re"

  roundedRect: (x, y, w, h, r = 0) ->
    r = Math.min(r, 0.5 * w, 0.5 * h)

    # amount to inset control points from corners (see `ellipse`)
    c = r * (1.0 - KAPPA)

    @moveTo x + r, y
    @lineTo x + w - r, y
    @bezierCurveTo x + w - c, y, x + w, y + c, x + w, y + r
    @lineTo x + w, y + h - r
    @bezierCurveTo x + w, y + h - c, x + w - c, y + h, x + w - r, y + h
    @lineTo x + r, y + h
    @bezierCurveTo x + c, y + h, x, y + h - c, x, y + h - r
    @lineTo x, y + r
    @bezierCurveTo x, y + c, x + c, y, x + r, y
    @closePath()

  ellipse: (x, y, r1, r2 = r1) ->
    # based on http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas/2173084#2173084
    x -= r1
    y -= r2
    ox = r1 * KAPPA
    oy = r2 * KAPPA
    xe = x + r1 * 2
    ye = y + r2 * 2
    xm = x + r1
    ym = y + r2

    @moveTo(x, ym)
    @bezierCurveTo(x, ym - oy, xm - ox, y, xm, y)
    @bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym)
    @bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye)
    @bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym)
    @closePath()

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

    values = (number(v) for v in [m11, m12, m21, m22, dx, dy]).join(' ')
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
