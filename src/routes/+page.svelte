
<script>
  // Libraries
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n'
	import { loader } from '$lib/loader';

  // Files
  import "$lib/scss/global.scss";
  import simulation from "$lib/simulation"
  
  // Stores
  import { isReady } from "$lib/stores/loading"
  import { categories, projects, clients } from "$lib/stores/nodes"
  import { width, height, pixelRatio, app } from "$lib/stores/canvas"
  
  // Components
  import App from "$lib/App.svelte";
  import Pixi from "$lib/components/webgl/organisms/Pixi.svelte";
  import LoadingScreen from "$lib/components/dom/organisms/LoadingScreen.svelte";

  export let data

  clients.set(data.clients)
  projects.set(data.projects)
  categories.set(data.categories)

  onMount(() => {
    simulation.data(data.nodes)
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


<Pixi bind:app={$app}/>
<App />

{#if !$isReady}
  <LoadingScreen />
{/if}


