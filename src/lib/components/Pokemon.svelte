<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { nodeSize, colorHeight } from "$lib/store/canvas"
  import fill from "$lib/drawers/fill"
  import stroke from "$lib/drawers/stroke"
  import getRegPolyPoints from "$lib/drawers/getRegPolyPoints.js"
  import rotateAroundPoint from "$lib/helpers/rotateAroundPoint.js"
  import getColorShape from "$lib/drawers/getColorShapePoints"
  import { 
    categories,
    goals,
    channels,
    designs,
    products
  } from "$lib/store/categories"

  export let node
  export let x = 0
  export let y = 0
  export let rotation = undefined

  const lw = 1.5 // line width

  const { canvasContexts } = getContext("layout")

  onMount(() => draw(canvasContexts))
  // onDestroy(() => canvasContexts.main.remove(draw))


  function draw({ main, goals }) {
    main.add(drawBackElements)
    main.add(drawChannel)
    main.add(drawFrontElements)
    goals.add(drawGoals)

  }

  $: center = [ x, y ]
  // $: basisPoints = node.basis !== 'consulting' && getRegPolyPoints(x, y, $nodeSize, node.basis === 'digital' ? 4 : 6)


  function rotate(arr, theta=0) {
    // Rotates an array of points [x1, y1, x2, y2, ...] around the center
    // based on rotation and provided theta

    let angle = theta
    
    if (rotation !== undefined) {
      angle += rotation + Math.PI/2 // Add 90 deg since 0 deg is horizontal in radial layout
    }

    const rotated = []
    for (let i=0; i<arr.length/2; i++) {
      const pair = arr.slice(i*2, i*2+2)
      rotated.push(...rotateAroundPoint(...pair, x, y, angle))
    }

    return rotated
  }


  function translate(arr) {
    // Translate given array of a point [x1, y1, x2, y2, ...] to the center of the unit
    return arr.map((d, i) => d + center[i%2])
  }


  function transform(arr) {
    // Transform a give array of points [[x1, x2], [x1, x2]...]
    if (Array.isArray(arr[0])) {
      return arr.map(p => rotate(translate(p)))
    }
    return rotate(translate(arr))
  }


  function linkEdges(ctx, points, close=true) {
    // Draw a path on the given context
    for (let i=0; i<points.length; i++) {
      const cmd = i === 0 ? 'moveTo' : 'lineTo'
      const [ px, py ] = points[i]
      ctx[cmd](px, py)
    }

    if (close) ctx.closePath()
  }


  function makeChannel(ctx) {
    ctx.beginPath()

    // Consulting (circle)
    if (node.channel === 2) {
      return ctx.arc(x, y, $channels.consulting, 0, 2*Math.PI)
    }

    // Digital or Print (regular polygon)
    const points = transform($channels[node.channel === 0 ? 'digital' : 'print'])
    linkEdges(ctx, points)
  }


  function drawChannel(ctx) {
    makeChannel(ctx)
    fill(ctx, 'white')
    stroke(ctx, 'black', lw)
  }

  function drawDesignIllustration(ctx) {
    const { lines } = $designs.illustration

    for (let line of lines) {
      ctx.beginPath()
      linkEdges(ctx, transform(line), false)
      stroke(ctx, 'black', lw)
    }
  }


  function drawDesignEditorial(ctx) {
    const { shapes } = $designs.editorial

    for (let shape of shapes) {
      ctx.beginPath()
      linkEdges(ctx, transform(shape))
      stroke(ctx, 'black', lw)
    }
  }


  function drawDesignService(ctx) {
    const { lines, circle } = $designs.service

    for (let line of lines) {
      ctx.beginPath()
      linkEdges(ctx, transform(line), false)
      stroke(ctx, 'black', lw)
    }

    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2*Math.PI)
    stroke(ctx, 'black', lw/2)
  }


  function drawDesignUI(ctx) {
    const { lines } = $designs.ui

    for (let line of lines) {
      ctx.beginPath()
      linkEdges(ctx, transform(line), false)
      stroke(ctx, 'black', lw)
    }
  }


  function drawDesignMotion(ctx) {
    const { line, circle } = $designs.motion

    ctx.beginPath()
    linkEdges(ctx, transform(line), false)
    stroke(ctx, 'black', lw)

    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2*Math.PI)
    fill(ctx, 'white')
    stroke(ctx, 'black', lw)
  }


  function drawProductVideo(ctx) {
    const { triangle, circle } = $products.video

    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2 * Math.PI)
    stroke(ctx, 'black', lw)

    ctx.beginPath()
    linkEdges(ctx, transform(triangle))
    fill(ctx, 'black')
  }


  function drawProductPublication(ctx) {
    const { shapes } = $products.publication

    ctx.beginPath()
    linkEdges(ctx, transform(shapes[0]))
    fill(ctx, 'black')
    stroke(ctx, 'black', lw)

    ctx.beginPath()
    linkEdges(ctx, transform(shapes[1]))
    stroke(ctx, 'black', lw)
  }


  function drawProductReport(ctx) {
    const { square } = $products.report

    ctx.beginPath()
    linkEdges(ctx, transform(square))
    fill(ctx, 'black')
  }


  function drawProductPresentation(ctx) {
    const { circle } = $products.presentation

    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2*Math.PI)
    stroke(ctx, 'black', lw)
  }


  function drawProductSiteInstitutional(ctx) {
    const { triangle, square } = $products.siteInstitutional

    ctx.beginPath()
    linkEdges(ctx, transform(square))
    stroke(ctx, 'black', lw)

    ctx.beginPath()
    linkEdges(ctx, transform(triangle))
    fill(ctx, 'black')
  }


  function drawProductInfographic(ctx) {
    const { shapes } = $products.infographic

    ctx.save()
    makeChannel(ctx)
    ctx.clip()

    ctx.beginPath()
    linkEdges(ctx, transform(shapes[0]))
    stroke(ctx, 'black', lw)

    makeChannel(ctx)
    ctx.beginPath()
    linkEdges(ctx, transform(shapes[1]))
    fill(ctx, 'black')

    ctx.restore()
  }


  function drawProductSiteEditorial(ctx) {
    const { circle } = $products.siteEditorial

    const t0 = -Math.PI/4 + (rotation ? rotation + Math.PI/2 : 0)
    const t1 = Math.PI/2 + Math.PI/4 + (rotation ? rotation + Math.PI/2 : 0)

    ctx.beginPath()
    ctx.arc(x, y, circle.radius, t0, t1)
    fill(ctx, 'black')

    ctx.beginPath()
    ctx.arc(x, y, circle.radius, 0, 2*Math.PI)
    stroke(ctx, 'black', lw)
  }


  function drawProductDashboard(ctx) {
    const { circles } = $products.dashboard

    const [ px, py ] = transform(circles[0].pos)

    const t0 = Math.PI + (rotation ? rotation + Math.PI/2 : 0)
    const t1 = 2*Math.PI + (rotation ? rotation + Math.PI/2 : 0)
    
    ctx.save()
    makeChannel(ctx)
    ctx.clip()

    ctx.beginPath()
    ctx.arc(px, py, circles[0].radius, t0, t1)
    stroke(ctx, 'black', lw)

    ctx.beginPath()
    ctx.arc(px, py, circles[1].radius, t0, t1)
    fill(ctx, 'black')

    ctx.restore()
  }


  function drawGoals(ctx) {
    for (let id of node.goals) {
      const goalPoints = $goals[id].map(translate)

      ctx.beginPath()
      for (let i=0; i<goalPoints.length; i++) {
        const cur = goalPoints[i]
        const next = goalPoints[(i+1)%(goalPoints.length)]

        const bezierParams = rotate([
          ...cur.slice(2, 4), 
          ...next.slice(4, 6),
          ...next.slice(0, 2)
        ])

        ctx.bezierCurveTo(...bezierParams)
      }

      ctx.fillStyle = $categories.goals.find(d => d.id === id).color
      ctx.fill()
    }
  }

  function drawBackElements(ctx) {
    node.designs.includes(0) && drawDesignIllustration(ctx)
    node.designs.includes(1) && drawDesignEditorial(ctx)
     node.designs.includes(3) && drawDesignService(ctx)
    node.designs.includes(4) && drawDesignUI(ctx)
  }

  function drawFrontElements(ctx) {
    node.designs.includes(2) && drawDesignMotion(ctx)

    node.products.includes(0) && drawProductVideo(ctx)
    node.products.includes(1) && drawProductPublication(ctx)
    node.products.includes(2) && drawProductReport(ctx)
    node.products.includes(3) && drawProductPresentation(ctx)
    node.products.includes(4) && drawProductSiteInstitutional(ctx)
    node.products.includes(5) && drawProductSiteEditorial(ctx)
    node.products.includes(6) && drawProductDashboard(ctx)
    node.products.includes(7) && drawProductInfographic(ctx)
  }

</script>