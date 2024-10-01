<script>
  import { _, locale } from 'svelte-i18n'

  import simulation from "$lib/simulation"
  

  // Stores
	import { width, height, figureWidth, complexityOn, linkClientOn, linkProjectOn, hovered, selected, sortBy, fyears, fdesigns, fgoals, findustries, fproducts, cameraOffsetY, loaded, isSheetOpen } from '$lib/stores';


  // Sections
  import MobileFrame from '$lib/sections/MobileFrame.svelte';
  import DesktopFrame from '$lib/sections/DesktopFrame.svelte';

  // DOM Components
  import TechSheet from '$lib/components/dom/molecules/TechSheet.svelte';
  import Onboarding from '$lib/sections/Onboarding.svelte';
  import Renderer from "$lib/components/webgl/Renderer.svelte";
  import LoadingScreen from "$lib/sections/LoadingScreen.svelte";



  let layout = 'block'

  $: simulation.setLayout(layout)
  $: simulation.filter($fyears, $findustries, $fdesigns, $fgoals, $fproducts)
  $: simulation.sort($sortBy)

  $: simulation.handleWindowResize($width)
  $: simulation.handleFigureResize($figureWidth)
  $: simulation.handleSelected($selected)
  $: simulation.handleHovered($hovered)
  $: simulation.handleComplexity($complexityOn)
  $: simulation.handleLinks("clients", $linkClientOn)
  $: simulation.handleLinks("projects", $linkProjectOn)
  $: simulation.handleLanguageChange($locale)

  $: console.log(layout)

</script>

<main class="relative overflow-hidden" style:width="{$width}px" style:height="{$height}px">

  <Renderer />

  {#if $loaded}
    {#if $width < 768} 
      <MobileFrame bind:layout />
    {:else}
      <DesktopFrame bind:layout />
    {/if}

    <TechSheet />

  {:else}
    <LoadingScreen />
  {/if}

  <Onboarding />

</main>



