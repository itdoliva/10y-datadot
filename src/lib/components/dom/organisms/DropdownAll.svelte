<script>
  import { _ } from 'svelte-i18n'

  // Stores
  import { sortBy } from "$lib/stores/nodes";
  import { complexityOn, linkProjectOn, linkClientOn } from "$lib/stores/canvas";

  // DOM Components
  import DropdownMenu from "$lib/components/dom/molecules/DropdownMenu.svelte";
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";

  // Sort
  const sortIds = [ "dt", "industry" ]

  $: sortCategories = sortIds.map(id => ({
    id,
    alias: $_(`menu.sort.values.${id}`)
  }))
  
  // Active
  let activeFeatures = []

  const featIds = [ "complexity", "link-project", "link-client" ]

  $: featCategories = featIds.map(id => ({
    id,
    alias: $_(`menu.active.values.${id}`)
  }))

  $: complexityOn.set(activeFeatures.includes('complexity'))
  $: linkProjectOn.set(activeFeatures.includes('link-project'))
  $: linkClientOn.set(activeFeatures.includes('link-client'))
</script>

<DropdownMenu>

  <div class="dropdown-section">
    <h5>{$_("menu.sort.title")}</h5>
    <InputGroup
      direction="column"
      categories={sortCategories}
      multiselect={false}
      onDark={true}
      bind:selected={$sortBy}
    />
  </div>

  <div class="dropdown-section">
    <h5>{$_("menu.active.title")}</h5>
    <InputGroup
      direction="column"
      categories={featCategories}
      multiselect={true}
      unselectBtn={false}
      onDark={true}
      bind:selected={activeFeatures}
    />
  </div>
</DropdownMenu>

<style lang="scss">
  .dropdown-section {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    gap: var(--fs-label);

    h5 {
      font-size: var(--fs-label);
      color: var(--clr-white);
    }
  }

</style>