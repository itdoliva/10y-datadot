<script>
  import App from "$lib/App.svelte";
  import "$lib/scss/global.scss";
  import { dataset, nodes, categories, projects, clients } from "$lib/stores/nodes"
  import { width, height, pixelRatio } from "$lib/stores/canvas"

  export let data

  console.log({ projects: data.projects, clients: data.clients })

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

{#if $nodes.length > 0}
  <App />
{/if}

