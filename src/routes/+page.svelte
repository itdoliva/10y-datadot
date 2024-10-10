
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
  <title>{data.meta.title}</title>
  <meta name="author" content="datadot + italo doliva">

  <meta property="og:site_name" content={data.meta.title}>
  <meta property="og:title" content={data.meta.title}>
  <meta property="og:type" content="website">
  <meta property="og:description" content={data.meta.description}>
  <meta property="og:image" content="/img/share-256x256.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:url" content="https://10.datadotestudio.com">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{data.meta.title}">
  <meta name="twitter:description" content={data.meta.description}>
  <meta name="twitter:image" content="/img/share-256x256.png">
  
  <meta name="theme-color" content="#6D78FC">
  
  <meta charset="UTF-8">
  <meta name="robots" content="index, follow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
</svelte:head>


<App />
