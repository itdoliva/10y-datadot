<script>
  import * as PIXI from "pixi.js"
  import castContainer from '$lib/actions/castContainer';
  import { categories, nodeSize } from '$lib/stores/nodes.js';
  import templates from "$lib/templates";
  
  export let id

  let size

  const category = Object.values($categories).flat()
    .find(d => d.id === id)


  const container = new PIXI.Container()
  
  const graphics = new PIXI.Graphics()

  container.addChild(graphics)

  templates[id](graphics)

  $: graphics.scale.set((size/$nodeSize) * .7)

</script>

<li class="file-traces__item">

  <div 
    class="primitive-holder"
    use:castContainer={{ container }}
    bind:clientWidth={size}
  />

  <p class="label">{category.alias}</p>

</li>

<style lang="scss">
  .file-traces__item {
    height: 3rem;

    display: grid;
    grid-template-columns: 4rem 1fr;
    
    padding-left: 2rem;

    gap: 2rem;

    justify-content: end;
  }

  .primitve-holder {
    aspect-ratio: 1/1;
  }

  .label {
    align-self: center;
    font-size: .8rem;
    text-transform: lowercase;
    text-decoration: underline;
  }
</style>