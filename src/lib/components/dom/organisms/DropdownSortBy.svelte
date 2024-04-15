<script>
  // Stores
  import { sortBy } from "$lib/stores/nodes";

  // DOM Components
  import DropdownMenu from "$lib/components/dom/molecules/DropdownMenu.svelte";
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";

  const sortCategories = [
    { alias: "data", id: "year" },
    { alias: "setor", id: "industry" },
  ]
</script>

<DropdownMenu title="organizar por">
  <InputGroup
    direction="column"
    categories={sortCategories}
    multiselect={false}
    bind:selected={$sortBy}
  />
</DropdownMenu>