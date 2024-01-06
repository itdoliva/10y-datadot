<script>
  import "./pixi.js"
  import { width, height, pixelRatio } from "$lib/store/canvas";
  import { nodes, nNodes, fyears, fdesigns, fgoals, findustries, fproducts } from "$lib/store/nodes";
  import { categories } from "$lib/store/categories";

  import Pixi from "$lib/components/Pixi.svelte";
  import Node from "$lib/components/Node.svelte";
  import Layout from "$lib/components/Layout.svelte";
  import PanelItem from "$lib/components/molecules/PanelItem.svelte";
  import InputGroup from "$lib/components/molecules/InputGroup.svelte";
  import YearSliderPicker from "./components/atoms/YearSliderPicker.svelte";
  import Multiselect from "./components/atoms/Multiselect.svelte";
  import Beeswarm from "./components/atoms/Beeswarm.svelte";

  let layout = 'block'

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
        <!-- <YearSliderPicker min={2014} max={2024} bind:selected={$fyears} /> -->
      </PanelItem>

      <PanelItem title="categorias de design">
        <Multiselect categories={$categories.designs} bind:selected={$fdesigns} direction='column' />
      </PanelItem>

      <PanelItem title="objetivos do projeto">
        <Multiselect categories={$categories.goals} bind:selected={$fgoals} direction='column' />
      </PanelItem>

      <PanelItem title="setores do mercado">
        <!-- <Beeswarm category="industry" categories={$categories.industries} bind:selected={$findustries} /> -->
      </PanelItem>
    </ul>
  </div>

  <div class="pb-wrapper">
    <PanelItem title="tipos de entrega">
        <Multiselect categories={$categories.products} bind:selected={$fproducts} />
    </PanelItem>
  </div>

  <div class="viz-wrapper">
    <Layout bind:layout>
      <Pixi>
        {#each $nodes as node (node.id)}
          <Node {node} />
        {/each}
      </Pixi>
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
    padding: 2em 1em 1em 2em;

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