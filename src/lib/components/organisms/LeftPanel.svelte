<script>
  import { fyears, fdesigns, fgoals, findustries, categoriesEnriched } from "$lib/stores/nodes";

  import YearSliderPicker from "$lib/components/organisms/YearSliderPicker.svelte";
  import Beeswarm from "$lib/components/organisms/Beeswarm.svelte";

  import PanelItem from "$lib/components/molecules/PanelItem.svelte";
  import InputGroup from "$lib/components/molecules/InputGroup.svelte";

  export let layout

  const layoutCategories = [
    { alias: "Block", id: "block" },
    { alias: "Radial", id: "radial" },
  ]
</script>

<ul class="pitems-wrapper pa-wrapper">

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

<style lang="scss">
  .pa-wrapper  {
    list-style-type: none;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    li {
      padding-bottom: .8rem;
      margin-bottom: .8rem;

      &:not(:last-child) {
        border-bottom: .5px solid black;
      }
    }
  }
</style>