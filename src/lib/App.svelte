<script>
	import { app, hovered } from '$lib/store/canvas.js';
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

  const layoutCategories = [
    { alias: "Block", id: "block" },
    { alias: "Radial", id: "radial" },
  ]

  $: console.log('findustries', $findustries)

</script>

<div class="root">

  <Pixi bind:app={$app}/>

  {#if $app}
    <div class="grid">

      <ul class="p-wrapper pa-wrapper">

        <li>
          <PanelItem icon="layouts" title="visualizar como">
            <InputGroup 
              gridlayout="layout"
              categories={layoutCategories} 
              multiselect={false} 
              bind:selected={layout}
            />
          </PanelItem>
        </li>

        <li>
          <PanelItem icon="period" title="período">
            <YearSliderPicker min={2014} max={2023} bind:selected={$fyears} />
          </PanelItem>
        </li>

        <li>
          <PanelItem icon="designs" title="categorias de design">
            <InputGroup 
              gridlayout="design"
              categories={$categoriesEnriched.designs} 
              direction='column' 
              bind:selected={$fdesigns} 
            />
          </PanelItem>
        </li>

        <li>
          <PanelItem icon="goals" title="objetivos do projeto">
            <InputGroup 
              gridlayout="goal"
              categories={$categoriesEnriched.goals} 
              direction='column' 
              bind:selected={$fgoals} 
            />
          </PanelItem>
        </li>

        <li>
          <PanelItem icon="industries" title="setores do mercado">
            <Beeswarm 
              categories={$categoriesEnriched.industries} 
              bind:selected={$findustries} 
            />
          </PanelItem>
        </li>
      </ul>

      <div class="p-wrapper pb-wrapper">
        <PanelItem icon="products" title="tipos de entrega">
            <InputGroup 
              gridlayout="product"
              categories={$categoriesEnriched.products} 
              bind:selected={$fproducts} 
            />
        </PanelItem>
      </div>

      <div class="viz-wrapper">
        <Visualization>
          <Layout bind:layout>
            {#each $nodes as node (node.id)}
              <Node {node} />
            {/each}
          </Layout>
        </Visualization>
      </div>
    </div>
  {/if}
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
    padding: 3.2rem 1.4rem 1.4rem 3.2rem;
  }

  ul.pa-wrapper  {
    height: 100%;
    grid-area: pa;
    border-right: 1px solid black;

    list-style-type: none;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    overflow-x: visible;
    overflow-y: auto;

    li {
      padding-bottom: .8rem;
      margin-bottom: .8rem;

      &:not(:last-child) {
        border-bottom: .5px solid black;
      }
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