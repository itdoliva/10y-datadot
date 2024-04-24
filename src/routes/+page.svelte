<script>
  import { _ } from 'svelte-i18n'

  // Libraries
  import { onMount } from "svelte";

  // Files
  import "$lib/scss/global.scss";
  
  // Stores
  import { dataset, nodes, categories, projects, clients } from "$lib/stores/nodes"
  import { width, height, pixelRatio, app } from "$lib/stores/canvas"
  
  // Components
  import App from "$lib/App.svelte";
  import Pixi from "$lib/components/webgl/organisms/Pixi.svelte";

  export let data

  // console.log({ projects: data.projects, clients: data.clients })

  clients.set(data.clients)
  projects.set(data.projects)
  categories.set(data.categories)
  dataset.set(data.nodes)

</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
/>


<svelte:head>
  <title>{$_("page.title")}</title>
</svelte:head>

<!-- Background Canvas -->
<Pixi bind:app={$app}/>

{#if $nodes.length > 0 && $app}
  <App />
{/if}

