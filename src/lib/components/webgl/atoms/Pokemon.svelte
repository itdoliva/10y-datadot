<script>
  import * as d3 from "d3"
	import { app, pixelRatio, complexityOn } from '$lib/stores/canvas';
  import * as PIXI from "pixi.js"
  import { dataset, categories } from '$lib/stores/nodes';
  import templates from "$lib/templates"

  export let context
  export let id

  const node = $dataset.find(d => d.id === id)

  const graphics = new PIXI.Graphics()
  graphics.cacheAsBitmap = true

  context.addChild(graphics)
  
  // Behind Basis
  if (node.designs.includes(20)) templates[20](graphics) // illustration
  if (node.designs.includes(21)) templates[21](graphics) // editorial
  if (node.designs.includes(23)) templates[23](graphics) // service
  if (node.designs.includes(24)) templates[24](graphics) // ui

  // Basis
  const basisGraphic = templates[node.channel](graphics)

  // In front of Basis
  if (node.products.includes(16)) graphics.addChild(mask(templates[16]())) // dashboard
  if (node.products.includes(17)) graphics.addChild(mask(templates[17]())) // infographic
  if (node.products.includes(10)) templates[10](graphics) // video
  if (node.products.includes(11)) templates[11](graphics) // publication
  if (node.products.includes(12)) templates[12](graphics) // report
  if (node.products.includes(13)) templates[13](graphics) // presentation
  if (node.products.includes(14)) templates[14](graphics) // siteInstitutional
  if (node.products.includes(15)) templates[15](graphics) // siteEditorial
  if (node.designs.includes(22)) templates[22](graphics) // motion

  node.goals.forEach(goalId => {
    templates[goalId](context)
  })

  function mask(graphic) {
    graphic.mask = new PIXI.Graphics(basisGraphic.geometry)
    graphic.addChild(graphic.mask)
    return graphic
  }

</script>
