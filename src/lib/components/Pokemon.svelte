<script>
	import { pixelRatio } from '$lib/store/canvas';
  import * as PIXI from "pixi.js"
  import { categories } from '$lib/store/categories';
  import templates from "$lib/templates"

  export let parent
  export let node

  const channelName = $categories.channels.find(d => d.id === node.channel).name
  
  const template = new PIXI.Graphics()
  template.cacheAsBitmap = true

  parent.addChild(template)
  

  // Behind Basis
  if (node.designs.includes(0)) templates.illustration(templates.options, template)
  if (node.designs.includes(1)) templates.editorial(templates.options, template)
  if (node.designs.includes(3)) templates.service(templates.options, template)
  if (node.designs.includes(4)) templates.ui(templates.options, template)

  // Basis
  const basisGraphic = templates[channelName](templates.options, template)

  // In front of Basis
  if (node.products.includes(6)) template.addChild(mask(templates.dashboard(templates.options)))
  if (node.products.includes(7)) template.addChild(mask(templates.infographic(templates.options)))
  if (node.products.includes(0)) templates.video(templates.options, template)
  if (node.products.includes(1)) templates.publication(templates.options, template)
  if (node.products.includes(2)) templates.report(templates.options, template)
  if (node.products.includes(3)) templates.presentation(templates.options, template)
  if (node.products.includes(4)) templates.siteInstitutional(templates.options, template)
  if (node.products.includes(5)) templates.siteEditorial(templates.options, template)
  if (node.designs.includes(2)) templates.motion(templates.options, template)


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
