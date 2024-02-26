<script>
	import { pixelRatio, complexityOn } from '$lib/stores/canvas';
  import * as PIXI from "pixi.js"
  import { dataset, categories } from '$lib/stores/nodes';
  import templates from "$lib/templates"

  export let parent
  export let id

  const node = $dataset.find(d => d.id === id)

  const channelName = $categories.channels.find(d => d.id === node.channel).name
  
  const graphics = new PIXI.Graphics()
  graphics.cacheAsBitmap = true
  
  parent.addChild(graphics)
  
  // Behind Basis
  if (node.designs.includes(20)) templates.illustration(graphics)
  if (node.designs.includes(21)) templates.editorial(graphics)
  if (node.designs.includes(23)) templates.service(graphics)
  if (node.designs.includes(24)) templates.ui(graphics)

  // Basis
  const basisGraphic = templates[channelName](graphics)

  // In front of Basis
  if (node.products.includes(16)) graphics.addChild(mask(templates.dashboard()))
  if (node.products.includes(17)) graphics.addChild(mask(templates.infographic()))
  if (node.products.includes(10)) templates.video(graphics)
  if (node.products.includes(11)) templates.publication(graphics)
  if (node.products.includes(12)) templates.report(graphics)
  if (node.products.includes(13)) templates.presentation(graphics)
  if (node.products.includes(14)) templates.siteInstitutional(graphics)
  if (node.products.includes(15)) templates.siteEditorial(graphics)
  if (node.designs.includes(22)) templates.motion(graphics)


  node.goals.forEach(d => {
    PIXI.Assets.load('/petal.png')
      .then(asset => new PIXI.Sprite(asset))
      .then(sprite => {
        sprite.anchor.set(.5, .9)
        sprite.scale.set($pixelRatio/2)
        sprite.rotation = d * 2*Math.PI/5
        sprite.tint = new PIXI.Color($categories.goals.find(({ id }) => id === d).color).toNumber()
        sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
        parent.addChild(sprite)
      })
  })


  function mask(graphic) {
    graphic.mask = new PIXI.Graphics(basisGraphic.geometry)
    graphic.addChild(graphic.mask)
    return graphic
  }




</script>
