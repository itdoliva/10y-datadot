<script>
	import { app, hoveredFilter } from '$lib/stores/canvas.js';
	import { selected } from '$lib/stores/nodes.js';
  import "./pixi.js"

  import Pixi from "$lib/components/Pixi.svelte";
  import LayoutManager from "$lib/components/LayoutManager.svelte";
  import Visualization from '$lib/components/Visualization.svelte';
  import File from '$lib/components/organisms/File.svelte';
  import LeftPanel from '$lib/components/organisms/LeftPanel.svelte';
  import TopPanel from '$lib/components/organisms/TopPanel.svelte';

  let layout = 'block'

</script>

<div class="root">

  {#if $app}
    <div class="pa-container">
      <LeftPanel bind:layout />
    </div>

    <div class="pb-container">
      <TopPanel />
    </div>

    <div class="viz-container">
      <Visualization>
        <LayoutManager bind:layout />
      </Visualization>

      <File />
    </div>
  {/if}

  <Pixi bind:app={$app}/>

</div>


<style lang="scss">
  .root {
    position: relative;
    overflow: hidden;

    width: 100%;
    height: 100%;
    
    display: grid;
    grid-template-rows: min-content repeat(4, 1fr);
    grid-template-columns: minmax(240px, 1fr) repeat(4, 1fr);
    grid-template-areas: 
      "pa pb pb pb pb"
      "pa vi vi vi vi"
      "pa vi vi vi vi"
      "pa vi vi vi vi"
      "pa vi vi vi vi";
  }


  .pa-container {
    grid-area: pa;

    border-right: 1px solid black;

    overflow-y: auto;
    overflow-x: visible;

    z-index: 1;
  }

  .pb-container {
    grid-area: pb;
    border-bottom: 1px solid black;

    z-index: 1;
  }

  .viz-container {
    position: relative;

    grid-area: vi;
    pointer-events: none;
  }

  :global(.pitems-wrapper) {
    padding: 3.2rem 1.4rem 1.4rem 3.2rem;
  }


</style>