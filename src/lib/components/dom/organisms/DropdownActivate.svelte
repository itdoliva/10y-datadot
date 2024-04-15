<script>
  // Stores
  import { sortBy } from "$lib/stores/nodes";
  import { complexityOn, linkProjectOn, linkClientOn } from "$lib/stores/canvas";

  // DOM Components
  import DropdownMenu from "$lib/components/dom/molecules/DropdownMenu.svelte";
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";
  
  let activeFeatures = []

  const featCategories = [
    { alias: "complexidade", id: "complexity" },
    { alias: "ver conexões por cliente", id: "link-client" },
    { alias: "ver conexões por projeto", id: "link-project" },
  ]

  $: complexityOn.set(activeFeatures.includes('complexity'))
  $: linkProjectOn.set(activeFeatures.includes('link-project'))
  $: linkClientOn.set(activeFeatures.includes('link-client'))

</script>

<DropdownMenu title="ativar">
  <InputGroup
    direction="column"
    categories={featCategories}
    multiselect={true}
    unselectBtn={false}
    bind:selected={activeFeatures}
  />
</DropdownMenu>