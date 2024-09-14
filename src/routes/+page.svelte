
<script>
  // Libraries
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import initPixi from '$lib/pixi.js'

  // Files
  import "$lib/scss/global.scss"
  import "$lib/style.css"
  import simulation from "$lib/simulation"
  
  // Stores
  import { loaded } from "$lib/stores/loading"
  import { categories, categoriesEnriched, projects, clients } from "$lib/stores/nodes"
  import { width, height, pixelRatio, app } from "$lib/stores/canvas"
  import { page } from '$app/stores';
  
  // Components
  import App from "$lib/App.svelte";
  import LoadingScreen from "$lib/components/dom/organisms/LoadingScreen.svelte";

  export let data

  clients.set(data.clients)
  projects.set(data.projects)
  categories.set(data.categories)

  $: console.log($categories)
  $: console.log($categoriesEnriched)

  let canvas

  onMount(() => {
    $app = initPixi(canvas)

    simulation.load(data.deliverables)
    
  })

  function handleResize() {
    window.location.reload();
  }



</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
  on:resize={handleResize}
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

{#if !$loaded}
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

