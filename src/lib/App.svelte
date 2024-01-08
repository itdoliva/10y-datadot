<script>
  import "./pixi.js"
  import { width, height, pixelRatio } from "$lib/store/canvas";
  import { nodes, nNodes, fyears, fdesigns, fgoals, findustries, fproducts } from "$lib/store/nodes";
  import { categories } from "$lib/store/categories";

  import Application from "$lib/components/Application.svelte";
  import Node from "$lib/components/Node.svelte";
  import Layout from "$lib/components/Layout.svelte";
  import PanelItem from "$lib/components/molecules/PanelItem.svelte";
  import YearSliderPicker from "./components/organisms/YearSliderPicker.svelte";
  import InputGroup from "./components/molecules/InputGroup.svelte";
  import Beeswarm from "./components/organisms/Beeswarm.svelte";

  let layout = 'block'

  const layoutCategories = [
    { alias: "Block", id: "block" },
    { alias: "Radial", id: "radial" },
  ]

</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
/>

<div class="grid">
  <div class="p-wrapper pa-wrapper">
    <ul>
      <PanelItem title="visualizar como">
        <InputGroup categories={layoutCategories} multiselect={false} bind:selected={layout}/>
      </PanelItem>

      <PanelItem title="período">
        <!-- <YearSliderPicker min={2014} max={2024} bind:selected={$fyears} /> -->
      </PanelItem>

      <PanelItem title="categorias de design">
        <InputGroup categories={$categories.designs} bind:selected={$fdesigns} direction='column' />
      </PanelItem>

      <PanelItem title="objetivos do projeto">
        <InputGroup categories={$categories.goals} bind:selected={$fgoals} direction='column' />
      </PanelItem>

      <PanelItem title="setores do mercado">
        <!-- <Beeswarm category="industry" categories={$categories.industries} bind:selected={$findustries} /> -->
      </PanelItem>
    </ul>
  </div>

  <div class="p-wrapper pb-wrapper">
    <PanelItem title="tipos de entrega">
        <InputGroup categories={$categories.products} bind:selected={$fproducts} />
    </PanelItem>
  </div>

  <div class="viz-wrapper">
    <Layout bind:layout>
      <Application>
        {#each $nodes as node (node.id)}
          <Node {node} />
        {/each}
      </Application>
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

  .p-wrapper {
    padding: 2rem 1rem 1rem 2rem;
  }

  .pa-wrapper {
    grid-area: pa;
    border-right: 1px solid black;

    ul {
      list-style-type: none;

      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;

      gap: 2rem;
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