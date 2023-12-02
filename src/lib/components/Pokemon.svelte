<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { nodeSize, colorHeight } from "$lib/store/canvas"
  import { categories } from "$lib/store/categories"
  import fill from "$lib/drawers/fill"
  import stroke from "$lib/drawers/stroke"
  import getRegPolyPoints from "$lib/drawers/getRegPolyPoints.js"
  import rotateAroundPoint from "$lib/helpers/rotateAroundPoint.js"
  import getColorShape from "$lib/drawers/getColorShapePoints"

  export let node
  export let x = 0
  export let y = 0
  export let rotation = undefined

  const lw = 1.5 // line width

  const { canvasContexts } = getContext("layout")

  onMount(() => canvasContexts.main.add(draw))
  onDestroy(() => canvasContexts.main.remove(draw))

  $: basisPoints = node.basis !== 'consulting' && getRegPolyPoints(x, y, $nodeSize, node.basis === 'digital' ? 4 : 6)


  function rotateIfNeeded([ px, py ], theta=0) {
    if ((rotation === undefined && theta === 0) || (px === x && py === y)) {
      return [ px, py ]
    }

    let angle = theta
    
    if (rotation !== undefined) {
      angle += rotation + Math.PI/2 // Add 90 deg since 0 deg is horizontal
    }

    return rotateAroundPoint(px, py, x, y, angle)
  }

  function linePoints(ctx, points, close=true) {
    for (let i=0; i<points.length; i++) {
      ctx[i === 0 ? 'moveTo' : 'lineTo'](...rotateIfNeeded(points[i]))
    }

    if (close) {
      ctx.closePath()
    }
  }


  // BASIS
  function drawBasis(ctx) {
    ctx.beginPath()

    node.basis === 'consulting'
      ? ctx.arc(x, y, $nodeSize/2, 0, 2 * Math.PI)
      : linePoints(ctx, basisPoints)

    fill(ctx, 'white')
    stroke(ctx, 'black', lw)

  }


  function draw(ctx) {
    drawBackElements(ctx)
    drawBasis(ctx)
    drawFrontElements(ctx)
    drawColoredShapes(ctx)
  }


  function drawBackElements(ctx) {
    // DESIGNS
    if (node.designs.includes('ilustracao')) {
      // Common proportion to reduce amount of calculations
      const cProp = $nodeSize*(.5+.34) 

      const topEdge = [x, y - $nodeSize*(.5+.48)]
      const leftEdge = [x - cProp, y + cProp]
      const rightEdge = [x + cProp, y + cProp]
      const bottomEdge = [x, y + $nodeSize]

      const edges = [ topEdge, leftEdge, rightEdge, bottomEdge ]

      for (let i=0; i<edges.length; i++) {
        const points = [ 
          [ x, y ], 
          edges[i] 
        ]

        ctx.beginPath()
        linePoints(ctx, points, false)
        stroke(ctx, 'black', lw)
      }
    }

    if (node.designs.includes('editorial')) {
      const cp1 = $nodeSize*.33
      
      // Triangle points
      const tPoints = [
        [x, y],
        [x - cp1, y - $nodeSize*.83],
        [x + cp1, y - $nodeSize*.83],
      ]

      // Square points
      const sPoints = [
        [x - cp1, y + $nodeSize/2],
        [x + cp1, y + $nodeSize/2],
        [x + cp1, y + $nodeSize*(.5+.16)],
        [x - cp1, y + $nodeSize*(.5+.16)],
      ]

      const shapes = [ tPoints, sPoints ]
      for (let i=0; i<shapes.length; i++) {
        ctx.beginPath()
        linePoints(ctx, shapes[i])
        stroke(ctx, 'black', lw)
      }
    }

    if (node.designs.includes('servicos')) {
      const hlinePoints = [
        [x-$nodeSize*.8, y+$nodeSize*.33],
        [x+$nodeSize*.86, y+$nodeSize*.33],
      ]

      const dlinePoints = [
        [x-$nodeSize*.48, y+$nodeSize*.85],
        [x+$nodeSize*.87, y-$nodeSize*.5],
      ]

      const lines = [hlinePoints, dlinePoints]
      for (let i=0; i<lines.length; i++) {
        ctx.beginPath()
        linePoints(ctx, lines[i], false)
        stroke(ctx, 'black', lw)
      }

      ctx.beginPath()
      ctx.arc(...rotateIfNeeded([x+$nodeSize*.15, y]), $nodeSize/2, 0, 2*Math.PI)
      stroke(ctx, 'black', lw/2)
    }

    if (node.designs.includes('ui')) {
      const cprop1= $nodeSize*.83
      
      // Upper line points
      const uline = [
        [x-cprop1, y-$nodeSize*.5],
        [x+$nodeSize*.5, y+cprop1],
      ]

      // Lower line points
      const lline = [
        [x-cprop1, y-$nodeSize*.17],
        [x+$nodeSize*.17, y+cprop1],
      ]

      const lines = [uline, lline]
      for (let i=0; i<lines.length; i++) {
        ctx.beginPath()
        linePoints(ctx, lines[i], false)
        stroke(ctx, 'black', lw)
      }
    }
  }

  function drawFrontElements(ctx) {
    // DESIGNS
    if (node.designs.includes('motion')) {
      const points = [
        [x-$nodeSize*.17, y+$nodeSize*.83],
        [x+$nodeSize*.83, y-$nodeSize*.17],
      ]

      ctx.beginPath()
      linePoints(ctx, points, false)
      stroke(ctx, 'black', lw)

      ctx.beginPath()
      ctx.arc(x+$nodeSize*.33, y+$nodeSize*.33, $nodeSize*.33/2, 0, 2*Math.PI)
      fill(ctx, 'white')
      stroke(ctx, 'black', lw)
      

    }

    // PRODUCTS
    if (node.products.includes('anima/video')) {
      ctx.beginPath()
      ctx.arc(x, y, $nodeSize/6, 0, 2 * Math.PI)
      stroke(ctx, 'black', lw)

      // Get triangle points
      const points = [
        [x, y],
        [x + $nodeSize*.12, y + $nodeSize*.2252],
        [x - $nodeSize*.12, y + $nodeSize*.2252],
      ]

      ctx.beginPath()
      linePoints(ctx, points)
      fill(ctx, 'black')
    }

    if (node.products.includes('publicacao')) {
      // Get center square points
      const cPoints = getRegPolyPoints(x, y, $nodeSize/3, 4)

      ctx.beginPath()
      linePoints(ctx, cPoints)
      fill(ctx, 'black')
      stroke(ctx, 'black', lw)

      // Get upper square points
      const uPoints = [
        [x + $nodeSize/6, y - $nodeSize*.15],
        [x + $nodeSize/6, y - $nodeSize*.32],
        [x - $nodeSize/6, y - $nodeSize*.32],
        [x - $nodeSize/6, y - $nodeSize*.15],
      ]

      ctx.beginPath()
      linePoints(ctx, uPoints)
      stroke(ctx, 'black', lw)
    }

    if (node.products.includes('relatorio')) {
      // Get center square points
      const points = getRegPolyPoints(x, y, $nodeSize/3, 4, Math.PI/4)

      ctx.beginPath()
      linePoints(ctx, points)
      fill(ctx, 'black')
    }

    if (node.products.includes('apresentacao')) {
      ctx.beginPath()
      ctx.arc(x, y, $nodeSize/6, 0, 2*Math.PI)
      stroke(ctx, 'black', lw)
    }

    if (node.products.includes('site-institucional')) {
      // Square
      const sPoints = getRegPolyPoints(x, y, $nodeSize/3, 4)
      
      ctx.beginPath()
      linePoints(ctx, sPoints)
      stroke(ctx, 'black', lw)

      // Triangle
      sPoints.splice(3, 1)

      ctx.beginPath()
      linePoints(ctx, sPoints)
      fill(ctx, 'black')
    }

    if (node.products.includes('infografico')) {
      // Outer triangle
      const oPoints = [
        [x, y],
        [x+$nodeSize/2, y+$nodeSize/2],
        [x-$nodeSize/2, y+$nodeSize/2],
      ]

      // Inner triangle
      const iPoints = [
        [x, y+$nodeSize/3],
        [x+$nodeSize*.16, y+$nodeSize/2],
        [x-$nodeSize*.16, y+$nodeSize/2],
      ]

      ctx.beginPath()
      linePoints(ctx, oPoints)
      stroke(ctx, 'black', lw)

      ctx.beginPath()
      linePoints(ctx, iPoints)
      fill(ctx, 'black')
    }

    if (node.products.includes('site-editorial')) {
      const t0 = -Math.PI/4 + (rotation ? rotation + Math.PI/2 : 0)
      const t1 = Math.PI/2 + Math.PI/4 + (rotation ? rotation + Math.PI/2 : 0)

      ctx.beginPath()
      ctx.arc(x, y, $nodeSize/6, t0, t1)
      fill(ctx, 'black')

      ctx.beginPath()
      ctx.arc(x, y, $nodeSize/6, 0, 2*Math.PI)
      stroke(ctx, 'black', lw)
    }

    if (node.products.includes('dashboard')) {
      const t0 = Math.PI + (rotation ? rotation + Math.PI/2 : 0)
      const t1 = 2*Math.PI + (rotation ? rotation + Math.PI/2 : 0)

      const [ px, py ] = rotateIfNeeded([x ,y+$nodeSize/2])
      ctx.beginPath()
      ctx.arc(px, py, $nodeSize/2, t0, t1)
      stroke(ctx, 'black', lw)

      ctx.beginPath()
      ctx.arc(px, py, $nodeSize/6, t0, t1)
      fill(ctx, 'black')
    }
  }

  function drawColoredShapes(ctx) {
    for (let i=0; i<node.goals.length; i++) {
      const goal = $categories.goals.find(d => d.name === node.goals[i])
      const { points, angle } = getColorShape(x, y, $colorHeight, goal.id)

      ctx.globalCompositeOperation = 'multiply'
      ctx.beginPath()
      for (let j=0; j<points.length; j++) {
        const cur = points[j]
        const nextI = (j+1)%(points.length)
        const next = points[nextI]

        ctx.bezierCurveTo(...rotateIfNeeded(cur.a1, angle), ...rotateIfNeeded(next.a2, angle), ...rotateIfNeeded(next.p, angle))
      }
      ctx.fillStyle = goal.color
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }
  }








</script>