<script>
  import { fyears, fdesigns, fgoals, findustries, fproducts, nodes, sortBy } from "$lib/stores/nodes";
  import { complexityOn, linkProjectOn, linkClientOn } from "$lib/stores/canvas";
  
  import Button from "$lib/components/dom/atoms/Button.svelte";
  import DropdownMenu from "$lib/components/dom/molecules/DropdownMenu.svelte";
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";
  import PlayButton from "$lib/components/dom/molecules/PlayButton.svelte";

  const sortCategories = [
    { alias: "data", id: "year" },
    { alias: "setor", id: "industry" },
  ]

  const featCategories = [
    { alias: "complexidade", id: "complexity" },
    { alias: "ver conexões por cliente", id: "link-client" },
    { alias: "ver conexões por projeto", id: "link-project" },
  ]

  let activeFeatures = []

  $: complexityOn.set(activeFeatures.includes('complexity'))
  $: linkProjectOn.set(activeFeatures.includes('link-project'))
  $: linkClientOn.set(activeFeatures.includes('link-client'))

  // $: console.log(activeFeatures, $linkClientOn, $linkProjectOn)

  function unselectAll() {
    fyears.set([ 2014, 2023 ])
    fdesigns.set([])
    fgoals.set([])
    findustries.set([])
    fproducts.set([])
  }

</script>

<ul class="panel-menu-container">

  <li>
    <DropdownMenu title="organizar por">
      <InputGroup 
        direction="column"
        categories={sortCategories} 
        multiselect={false}
        bind:selected={$sortBy}
      />
    </DropdownMenu>
  </li>

  <li>    
    <DropdownMenu title="ativar">
      <InputGroup 
        direction="column"
        categories={featCategories} 
        multiselect={true}
        unselectBtn={false}
        bind:selected={activeFeatures}
      />
    </DropdownMenu>
  </li>

  <li class="unselectall-btn">
    <Button 
      disabled={$nodes.length === $nodes.activeCount}
      onClick={unselectAll}
    >
      X 
      <svelte:fragment slot="text">LIMPAR TODOS OS FILTROS</svelte:fragment>
    </Button>
  </li>

  <li><PlayButton /></li>
  <li class="viz-title">datadot 10 anos</li>

</ul>

<style lang="scss">
  .panel-menu-container {

    display: grid;
    grid-template-columns: repeat(4, minmax(min-content, 1fr)) 3fr;
    align-content: stretch;

    li {
      font-size: .6875rem;


      &:not(:last-child) {
        border-right: 1px solid black;
      }

      &.viz-title {
        padding: .25rem 1rem;
        font-size: 1rem;
      }

      &.unselectall-btn {
        padding: .25rem 1rem;
      }
    }
  }
</style>