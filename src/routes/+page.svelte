
<script>
  // Libraries
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n'
  import initPixi from '$lib/pixi.js';

  // Files
  import "$lib/scss/global.scss";
  import simulation from "$lib/simulation"
  
  // Stores
  import { nodesLoaded } from "$lib/stores/loading"
  import { categories, projects, clients } from "$lib/stores/nodes"
  import { width, height, pixelRatio, app } from "$lib/stores/canvas"
  
  // Components
  import App from "$lib/App.svelte";
  import LoadingScreen from "$lib/components/dom/organisms/LoadingScreen.svelte";

  export let data

  clients.set(data.clients)
  projects.set(data.projects)
  categories.set(data.categories)

  let canvas

  onMount(() => {
    $app = initPixi(canvas)

    simulation.load(data.nodes)
  })

</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
/>

<svelte:head>
  <title>{$_("page.title")}</title>
</svelte:head>


<canvas 
  id="canvas" 
  style:width="{$width}px"
  style:height="{$height}px"
  bind:this={canvas} 
/>

<App />

{#if !$nodesLoaded}
  <LoadingScreen width={$width} height={$height} />
{/if}


<style>
  canvas {
    position: absolute;
    left: 0;
    top: 0;

    z-index: 0;
  }
</style>

