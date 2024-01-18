<script>
	import { hovered } from '$lib/store/canvas.js';
  import "./pixi.js"
  import { nodes, nNodes, fyears, fdesigns, fgoals, findustries, fproducts } from "$lib/store/nodes";
  import { categoriesEnriched } from "$lib/store/categories";

  import Pixi from "$lib/components/Pixi.svelte";
  import Node from "$lib/components/Node.svelte";
  import Layout from "$lib/components/Layout.svelte";
  import PanelItem from "$lib/components/molecules/PanelItem.svelte";
  import YearSliderPicker from "./components/organisms/YearSliderPicker.svelte";
  import InputGroup from "./components/molecules/InputGroup.svelte";
  import Beeswarm from "./components/organisms/Beeswarm.svelte";
  import Visualization from '$lib/components/Visualization.svelte';


  let layout = 'block'
  let app

  let contentBoxSize

  $: console.log(contentBoxSize)

  const layoutCategories = [
    { alias: "Block", id: "block" },
    { alias: "Radial", id: "radial" },
  ]
// https://webglfundamentals.org/webgl/lessons/webgl-multiple-views.html#toc
</script>

<div class="root">

  <Pixi bind:app={app}/>

  <div class="grid">
    <div class="p-wrapper pa-wrapper"  bind:borderBoxSize={contentBoxSize}>
      <ul>
        <PanelItem title="visualizar como">
          <InputGroup 
            gridlayout="layout"
            categories={layoutCategories} 
            multiselect={false} 
            bind:selected={layout}
          />
        </PanelItem>

        <PanelItem title="período">
          <!-- <YearSliderPicker min={2014} max={2024} bind:selected={$fyears} /> -->
        </PanelItem>

        <PanelItem title="categorias de design">
          <InputGroup 
            gridlayout="design"
            categories={$categoriesEnriched.designs} 
            direction='column' 
            visualElement='pctBar'
            bind:selected={$fdesigns} 
          />
        </PanelItem>

        <PanelItem title="objetivos do projeto">
          <InputGroup 
          gridlayout="goal"
            categories={$categoriesEnriched.goals} 
            direction='column' 
            visualElement='colorBullet'
            bind:selected={$fgoals} 
          />
        </PanelItem>

        <PanelItem title="setores do mercado">
          <!-- <Beeswarm category="industry" categories={$categories.industries} bind:selected={$findustries} /> -->
        </PanelItem>
      </ul>
    </div>

    <div class="p-wrapper pb-wrapper">
      <PanelItem title="tipos de entrega">
          <InputGroup 
            gridlayout="product"
            categories={$categoriesEnriched.products} 
            bind:selected={$fproducts} 
          />
      </PanelItem>
    </div>

    <div class="viz-wrapper">
      {#if app}
        <Visualization app={app}>
          <Layout bind:layout>
            {#each $nodes as node (node.id)}
              <Node {node} />
            {/each}
          </Layout>
        </Visualization>
      {/if}
    </div>
  </div>
</div>


<style lang="scss">
  .root {
    position: relative;
  }

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