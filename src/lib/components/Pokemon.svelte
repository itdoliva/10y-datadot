<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { nodeSize } from "$lib/store/canvas"
  import rotateAroundPoint from "$lib/utility/rotateAroundPoint.js"

  export let x = 0
  export let y = 0
  export let rotation = undefined

  const canvasContext = getContext("canvas")
  const layoutContext = getContext("layout")

  onMount(() => canvasContext.add(draw))
  onDestroy(() => canvasContext.remove(draw))


  function rotateIfNeeded(px, py) {
    return rotation === undefined
      ? [ px, py ]
      : rotateAroundPoint(px, py, x, y, rotation)
  }


  function draw(ctx) {
    const points = [
      [x - $nodeSize/2, y - $nodeSize/2],
      [x + $nodeSize/2, y - $nodeSize/2],
      [x + $nodeSize/2, y + $nodeSize/2],
      [x - $nodeSize/2, y + $nodeSize/2]
    ]

    ctx.beginPath()
    ctx.fillStyle = 'black'

    for (let i=0; i<points.length; i++) {
      const [ px, py ] = rotateIfNeeded(...points[i])
      ctx[i === 0 ? 'moveTo' : 'lineTo'](px, py)
    }

    ctx.closePath()
    ctx.fill()
  }

</script>