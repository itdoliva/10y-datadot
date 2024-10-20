
<script>
  // Libraries
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'

  // Files
  import "$lib/scss/global.scss"
  import "$lib/style.css"
  import simulation from "$lib/simulation"
  
  // Stores
  import { categories, projects, clients, yearRange } from "$lib/stores/nodes"
  import { width, height, pixelRatio } from "$lib/stores/canvas"
  
  // Components
  import App from "$lib/App.svelte";

  export let data

  clients.set(data.clients)
  projects.set(data.projects)
  categories.set(data.categories)
  yearRange.set(data.yearRange)



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
  <title>{data.meta.title}</title>
  <meta charset="UTF-8">
  <meta name="author" content="datadot + italo doliva">
  <meta name="description" content={data.meta.description}>
  <meta name="theme-color" content="#6D78FC">
  <meta name="robots" content="index, follow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <meta property="og:site_name" content={data.meta.title}>
  <meta property="og:title" content={data.meta.title}>
  <meta property="og:type" content="website">
  <meta property="og:description" content={data.meta.description}>
  <meta property="og:image" content="{data.meta.vercelURL}/img/share.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:url" content="https://10.datadotestudio.com">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{data.meta.title}">
  <meta name="twitter:description" content={data.meta.description}>
  <meta name="twitter:image" content="{data.meta.vercelURL}/img/share.png">
</svelte:head>

{#if typeof window !== 'undefined'}
  <App />
{/if}