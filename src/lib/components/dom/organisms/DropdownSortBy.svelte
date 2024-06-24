<script>
  import { _ } from 'svelte-i18n'

  // Stores
  import { sortBy } from "$lib/stores/nodes";

  // DOM Components
  import DropdownMenu from "$lib/components/dom/molecules/DropdownMenu.svelte";
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";

  const sortIds = [ "dt", "industry" ]

  $: sortCategories = sortIds.map(id => ({
    id,
    alias: $_(`menu.sort.values.${id}`)
  }))

</script>

<DropdownMenu title={$_("menu.sort.title")}>
  <InputGroup
    direction="column"
    categories={sortCategories}
    multiselect={false}
    onDark={true}
    bind:selected={$sortBy}
  />
</DropdownMenu>