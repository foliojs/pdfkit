class SVGPath
    @apply: (doc, path) ->
        commands = parse path
        apply commands, doc
        
    parameters =
        A: 7
        a: 7
        C: 6
        c: 6
        H: 1
        h: 1
        L: 2
        l: 2
        M: 2
        m: 2
        Q: 4
        q: 4
        S: 4
        s: 4
        T: 2
        t: 2
        V: 1
        v: 1
        Z: 0
        z: 0

    parse = (path) ->
        ret = []
        args = []
        curArg = ""
        foundDecimal = no
        params = 0

        for c in path
            if parameters[c]?
                params = parameters[c]
                if cmd # save existing command
                    args[args.length] = +curArg if curArg.length > 0
                    ret[ret.length] = {cmd,args}

                    args = []
                    curArg = ""
                    foundDecimal = no

                cmd = c

            else if c in [" ", ","] or (c is "-" and curArg.length > 0) or (c is "." and foundDecimal)
                continue if curArg.length is 0

                if args.length is params # handle reused commands
                    ret[ret.length] = {cmd,args}
                    args = [+curArg]

                    # handle assumed commands
                    cmd = "L" if cmd is "M"
                    cmd = "l" if cmd is "m"

                else
                    args[args.length] = +curArg

                foundDecimal = (c is ".")

                # fix for negative numbers or repeated decimals with no delimeter between commands
                curArg = if c in ['-', '.'] then c else ''

            else
                curArg += c
                foundDecimal = true if c is '.'

        # add the last command
        args[args.length] = +curArg if curArg.length > 0
        ret[ret.length] = {cmd,args}
        
        return ret
    
    cx = cy = px = py = 0
    apply = (commands, doc) ->
        cx = cy = px = py = 0

        # run the commands
        for c, i in commands
            runners[c.cmd]?(doc, c.args)
            
        cx = cy = px = py = 0

    runners = 
        M: (doc, a) ->
            cx = a[0]
            cy = a[1]
            px = py = null
            doc.moveTo cx, cy

        m: (doc, a) ->
            cx += a[0]
            cy += a[1]
            px = py = null
            doc.moveTo cx, cy

        C: (doc, a) ->
            cx = a[4]
            cy = a[5]
            px = a[2]
            py = a[3]
            doc.bezierCurveTo a...

        c: (doc, a) ->
            doc.bezierCurveTo a[0] + cx, a[1] + cy, a[2] + cx, a[3] + cy, a[4] + cx, a[5] + cy
            px = cx + a[2]
            py = cy + a[3]
            cx += a[4]
            cy += a[5]

        S: (doc, a) ->
            if px is null
                px = cx
                py = cy

            doc.bezierCurveTo cx-(px-cx), cy-(py-cy), a[0], a[1], a[2], a[3]
            px = a[0]
            py = a[1]
            cx = a[2]
            cy = a[3]

        s: (doc, a) ->
            doc.bezierCurveTo cx-(px-cx), cy-(py-cy), cx + a[0], cy + a[1], cx + a[2], cy + a[3]
            px = cx + a[0]
            py = cy + a[1]
            cx += a[2]
            cy += a[3]
            
        Q: (doc, a) ->
            px = a[0]
            py = a[1]
            cx = a[2]
            cy = a[3]
            doc.quadraticCurveTo(a[0], a[1], cx, cy)

        q: (doc, a) ->
            doc.quadraticCurveTo(a[0] + cx, a[1] + cy, a[2] + cx, a[3] + cy)
            px = cx + a[0]
            py = cy + a[1]
            cx += a[2]
            cy += a[3]

        T: (doc, a) ->
            if px is null
                px = cx
                py = cy
            else 
                px = cx-(px-cx)
                py = cy-(py-cy)

            doc.quadraticCurveTo(px, py, a[0], a[1])
            px = cx-(px-cx)
            py = cy-(py-cy)
            cx = a[0]
            cy = a[1]

        t: (doc, a) ->
            if px is null
                px = cx
                py = cy
            else
                px = cx-(px-cx)
                py = cy-(py-cy)

            doc.quadraticCurveTo(px, py, cx + a[0], cy + a[1])
            cx += a[0]
            cy += a[1]

        A: (doc, a) ->
            solveArc(doc, cx, cy, a)
            cx = a[5]
            cy = a[6]

        a: (doc, a) ->
            a[5] += cx
            a[6] += cy
            solveArc(doc, cx, cy, a)
            cx = a[5]
            cy = a[6]

        L: (doc, a) ->
            cx = a[0]
            cy = a[1]
            px = py = null
            doc.lineTo(cx, cy)

        l: (doc, a) ->
            cx += a[0]
            cy += a[1]
            px = py = null
            doc.lineTo(cx, cy)

        H: (doc, a) ->
            cx = a[0]
            px = py = null
            doc.lineTo(cx, cy)

        h: (doc, a) ->
            cx += a[0]
            px = py = null
            doc.lineTo(cx, cy)

        V: (doc, a) ->
            cy = a[0]
            px = py = null
            doc.lineTo(cx, cy)

        v: (doc, a) ->
            cy += a[0]
            px = py = null
            doc.lineTo(cx, cy)

        Z: (doc) ->
            doc.closePath()

        z: (doc) ->
            doc.closePath()

    solveArc = (doc, x, y, coords) ->
        [rx,ry,rot,large,sweep,ex,ey] = coords
        segs = arcToSegments(ex, ey, rx, ry, large, sweep, rot, x, y)

        for seg in segs
            bez = segmentToBezier segs...
            doc.bezierCurveTo bez...

    # from Inkscape svgtopdf, thanks!
    arcToSegments = (x, y, rx, ry, large, sweep, rotateX, ox, oy) ->
        th = rotateX * (Math.PI/180)
        sin_th = Math.sin(th)
        cos_th = Math.cos(th)
        rx = Math.abs(rx)
        ry = Math.abs(ry)
        px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5
        py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5
        pl = (px*px) / (rx*rx) + (py*py) / (ry*ry)
        if pl > 1
          pl = Math.sqrt(pl)
          rx *= pl
          ry *= pl

        a00 = cos_th / rx
        a01 = sin_th / rx
        a10 = (-sin_th) / ry
        a11 = (cos_th) / ry
        x0 = a00 * ox + a01 * oy
        y0 = a10 * ox + a11 * oy
        x1 = a00 * x + a01 * y
        y1 = a10 * x + a11 * y

        d = (x1-x0) * (x1-x0) + (y1-y0) * (y1-y0)
        sfactor_sq = 1 / d - 0.25
        sfactor_sq = 0 if sfactor_sq < 0
        sfactor = Math.sqrt(sfactor_sq)
        sfactor = -sfactor if sweep is large

        xc = 0.5 * (x0 + x1) - sfactor * (y1-y0)
        yc = 0.5 * (y0 + y1) + sfactor * (x1-x0)

        th0 = Math.atan2(y0-yc, x0-xc)
        th1 = Math.atan2(y1-yc, x1-xc)

        th_arc = th1-th0
        if th_arc < 0 && sweep is 1
          th_arc += 2*Math.PI
        else if th_arc > 0 && sweep is 0
          th_arc -= 2 * Math.PI

        segments = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)))
        result = []

        for i in [0...segments]
          th2 = th0 + i * th_arc / segments
          th3 = th0 + (i+1) * th_arc / segments
          result[i] = [xc, yc, th2, th3, rx, ry, sin_th, cos_th]

        return result

    segmentToBezier = (cx, cy, th0, th1, rx, ry, sin_th, cos_th) ->
        a00 = cos_th * rx
        a01 = -sin_th * ry
        a10 = sin_th * rx
        a11 = cos_th * ry

        th_half = 0.5 * (th1 - th0)
        t = (8 / 3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5) / Math.sin(th_half)
        x1 = cx + Math.cos(th0) - t * Math.sin(th0)
        y1 = cy + Math.sin(th0) + t * Math.cos(th0)
        x3 = cx + Math.cos(th1)
        y3 = cy + Math.sin(th1)
        x2 = x3 + t * Math.sin(th1)
        y2 = y3 - t * Math.cos(th1)

        return [
          a00 * x1 + a01 * y1,   a10 * x1 + a11 * y1,
          a00 * x2 + a01 * y2,   a10 * x2 + a11 * y2,
          a00 * x3 + a01 * y3,   a10 * x3 + a11 * y3
        ]

module.exports = SVGPath