
<script>
  // Libraries
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'

  // Files
  import "$lib/scss/global.scss"
  import "$lib/style.css"
  import simulation from "$lib/simulation"
  
  // Stores
  import { loaded } from "$lib/stores/loading"
  import { categories, projects, clients } from "$lib/stores/nodes"
  import { width, height, pixelRatio } from "$lib/stores/canvas"
  
  // Components
  import App from "$lib/App.svelte";

  export let data

  clients.set(data.clients)
  projects.set(data.projects)
  categories.set(data.categories)



  onMount(() => {
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
  <meta name="author" content="datadot + italo doliva">

  <meta property="og:title" content="{$_("page.title")}">
  <meta property="og:description" content="{$_("page.description")}">
  <!-- <meta property="og:image" content="URL-to-image.jpg"> -->
  <!-- <meta property="og:url" content="https://example.com"> -->

  <!-- <meta name="twitter:card" content="summary_large_image"> -->
  <meta name="twitter:title" content="{$_("page.title")}">
  <meta name="twitter:description" content="{$_("page.description")}">
  <!-- <meta name="twitter:image" content="URL-to-image.jpg"> -->
  
  <meta name="theme-color" content="#6D78FC">
  
  <meta charset="UTF-8">
  <meta name="robots" content="index, follow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
</svelte:head>


<App />
