<script>
  import { onMount, getContext } from "svelte";

  import * as PIXI from "pixi.js"
  import * as d3 from "d3"
  import { gsap } from "gsap"

  import { app, hoveredNode } from "$lib/stores/canvas";

  import grahamScan from "$lib/utility/grahamScan"


  export let type
  export let id
  export let color
  export let linkNodes
  export let isLinkOn

  const { scene } = getContext("viz")
  
  // Attributes
  const tlAlpha = gsap.timeline()
  const tlLineWidth = gsap.timeline()

  const attr = {
    lineWidth: 1,
    alpha: 1,
    renderable: false,
    circleRadius: 0
  }

  const target = {
    lineWidth: 3,
    alpha: .15,
    circleRadius: 30
  }

  // PIXI Hierarchy
  const context = new PIXI.Graphics()

  context.blendMode = PIXI.BLEND_MODES.MULTIPLY

  scene.addChild(context)

  $app.ticker.add(() => {
    context.clear()

    context.lineStyle({ 
      width: attr.lineWidth,
      color: color,
      alpha: attr.alpha,
      join: PIXI.LINE_JOIN.ROUND, 
      cap: PIXI.LINE_CAP.ROUND 
    })

    if (!context.renderable) {
      return
    }

    const coords = linkNodes
      .filter(d => d.isActive() && !d.isSelected)
      .map(({ attr }) => grahamScan([ attr.x, attr.y ]))

    if (coords.length < 2) {
      return
    }

    context.moveTo(...coords[0])
    coords.slice(1).forEach(coord => {
      context.lineTo(...coord)
    })

    context.lineStyle(0)
    context.beginFill(color, attr.alpha)
    coords.forEach(coord => {
      context.drawCircle(...coord, attr.circleRadius)
    })
    context.endFill()
  })

  $: isHovered = $hoveredNode && $hoveredNode[type + "Id"] === id
  $: toggleHovered(isHovered)
  $: toggleLink(isLinkOn)


  function toggleHovered(isHovered) {
    target.lineWidth = isHovered ? 12 : 3
    target.alpha = isHovered ? .85 : .15
    target.circleRadius = isHovered ? 30 : 0

    tlLineWidth.clear()
    tlLineWidth.to(attr,
      { lineWidth: target.lineWidth, circleRadius: target.circleRadius, duration: .3, ease: d3.easeCubicInOut })

    tlAlpha.clear()
    tlAlpha.to(attr,
      { alpha: target.alpha, duration: .3, ease: d3.easeCubicInOut})
  }


  function toggleLink(isLinkOn) {
    if (isLinkOn) {
      tlAlpha.fromTo(attr,
        { alpha: 0 },
        { alpha: target.alpha, 

          duration: .5, 
          ease: d3.easeCubicInOut, 
          onStart: () => context.renderable = isLinkOn
        })
    }
    else {
      tlAlpha.fromTo(attr,
        { alpha: target.alpha },
        { alpha: 0, 

          duration: .15, 
          ease: d3.easeCubicInOut, 
          onComplete: () => context.renderable = isLinkOn
        })
    }

  }



</script>

