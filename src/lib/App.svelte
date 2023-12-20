<script>
  import { width, height, pixelRatio } from "$lib/store/canvas";
  import { nodes, fyears } from "$lib/store/nodes";
  import { writable, derived } from "svelte/store";

  import Canvas from "$lib/components/Canvas.svelte";
  import Unit from "$lib/components/Unit.svelte";
  import Layout from "$lib/components/Layout.svelte";
  import PanelItem from "$lib/components/molecules/PanelItem.svelte";
  import InputGroup from "$lib/components/molecules/InputGroup.svelte";
  import YearSliderPicker from "./components/atoms/YearSliderPicker.svelte";

  let layout = 'block'

  $: console.log({ nodes: $nodes })

  const vizLayouts = [
    { text: "Block", value: "block" },
    { text: "Radial", value: "radial" },
  ]

</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
/>

<div class="grid">
  <div class="pa-wrapper">
    <ul>
      <PanelItem title="visualizar como">
        <InputGroup data={vizLayouts} bind:selected={layout}/>
      </PanelItem>

      <PanelItem title="período">
        <YearSliderPicker min={2014} max={2024} bind:selected={$fyears} />
      </PanelItem>

      <PanelItem title="categorias de design">
      </PanelItem>

      <PanelItem title="objetivos do projeto">
      </PanelItem>

      <PanelItem title="setores do mercado">
      </PanelItem>
    </ul>
  </div>

  <div class="pb-wrapper">
    <PanelItem title="tipos de entrega">
        
    </PanelItem>
  </div>

  <div class="viz-wrapper">
    <Layout bind:layout>
      <Canvas key="main" />
      <Canvas key="goals" composition='multiply' mixBlendMode='multiply'/>
      {#each $nodes as node (node.id)}
        <Unit {node} />
      {/each}
    </Layout>
  </div>
</div>


<style lang="scss">
  .grid {
    width: 100vw;
    height: 100vh;

    position: relative;
    display: grid;
    grid-template-rows: repeat(5, 1fr);
    grid-template-columns: minmax(240px, 1fr) repeat(4, 1fr);
    grid-template-areas: 
      "pa pb pb pb pb"
      "pa vi vi vi vi"
      "pa vi vi vi vi"
      "pa vi vi vi vi"
      "pa vi vi vi vi";
  }

  .pa-wrapper {
    grid-area: pa;
    border-right: 1px solid black;

    ul {
      list-style-type: none;
    }
  }

  .pb-wrapper {
    grid-area: pb;
    border-bottom: 1px solid black;
  }

  .viz-wrapper {
    grid-area: vi;
  }
</style>