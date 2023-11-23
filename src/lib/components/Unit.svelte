<script>
  import { getContext, onDestroy, onMount } from "svelte";

  export let size = 100
  export let x = 0
  export let y = 0
  export let basis
  export let productList = []
  export let designList = []

  let canvasContext = getContext("canvas")

  onMount(() => canvasContext.add(draw))
  onDestroy(() => canvasContext.remove(draw))

  function draw(ctx) {
    drawCenter(ctx)
    drawBasis(ctx)
    drawProducts(ctx)
    // drawDesign(ctx)
    // drawShades(ctx)
  }

  function drawCenter(ctx) {
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2*Math.PI, false)
    fill(ctx, 'black')
  }

  function drawBasis(ctx) {
    if (basis === 'digital') {
      drawPolygon(ctx, +x, +y, 4, size*.64, Math.PI/4)
    }
    else if (basis === 'print') {
      drawPolygon(ctx, +x, +y, 8, size*.54, 45*Math.PI/360)
    }
    else if (basis === 'consulting') {
      drawCircle(ctx, +x, +y, size/2)
    }

    stroke(ctx, 'black')
  }


  function drawProducts(ctx) {
    if (productList.includes('video')) {
      const width = size * 22.87/100
      const height = size * 22.39/100
      
      ctx.beginPath()

    }
  }


  function drawPolygon(ctx, centerX, centerY, sides, radius, startAngle=0) {
    // Calculate the angle between each side of the polygon
    const angle = 2*Math.PI / sides

    // Move to the initial point on the circumference
    const startX = centerX + radius * Math.cos(startAngle)
    const startY = centerY + radius * Math.sin(startAngle)

    ctx.beginPath()
    ctx.moveTo(startX, startY)

    for (let i = 1; i <= sides; i++) {
      const x = centerX + radius * Math.cos(startAngle + angle * i)
      const y = centerY + radius * Math.sin(startAngle + angle * i)
      ctx.lineTo(x, y)
    }

    ctx.closePath()
  }


  function drawCircle(ctx, centerX, centerY, radius) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2*Math.PI)
  }


  function fill(ctx, color) {
    ctx.fillStyle = color
    ctx.fill()
  }


  function stroke(ctx, stroke, width=1) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = width
    ctx.stroke()
  }

</script>