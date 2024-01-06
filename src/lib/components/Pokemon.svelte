<script>
  import * as PIXI from "pixi.js"
  import { categories } from '$lib/store/categories';
  import templates from "$lib/templates"

  const options = {
    nodeSize: 20,
    lineWidth: 1.5,
  }

  export let parent
  export let node


  const channelName = $categories.channels.find(d => d.id === node.channel).name
  
  const template = new PIXI.Graphics()
  parent.addChild(template)



  // Behind Basis
  if (node.designs.includes(0)) templates.illustration(options, template)
  if (node.designs.includes(1)) templates.editorial(options, template)
  if (node.designs.includes(3)) templates.service(options, template)
  if (node.designs.includes(4)) templates.ui(options, template)

  // Basis
  templates[channelName](options, template)

  // In front of Basis
  // if (node.products.includes(6)) templates.dashboard(options, template)
  // if (node.products.includes(7)) templates.infographic(options, template)
  if (node.products.includes(0)) templates.video(options, template)
  if (node.products.includes(1)) templates.publication(options, template)
  if (node.products.includes(2)) templates.report(options, template)
  if (node.products.includes(3)) templates.presentation(options, template)
  if (node.products.includes(4)) templates.siteInstitutional(options, template)
  if (node.products.includes(5)) templates.siteEditorial(options, template)
  if (node.designs.includes(2)) templates.motion(options, template)


</script>
