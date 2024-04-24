<script>
  import { _ } from 'svelte-i18n'
  
  // Stores
  import { sortBy } from "$lib/stores/nodes";
  import { complexityOn, linkProjectOn, linkClientOn } from "$lib/stores/canvas";

  // DOM Components
  import DropdownMenu from "$lib/components/dom/molecules/DropdownMenu.svelte";
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";
  
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

<DropdownMenu title={$_("menu.active.title")}>
  <InputGroup
    direction="column"
    categories={featCategories}
    multiselect={true}
    unselectBtn={false}
    onDark={true}
    bind:selected={activeFeatures}
  />
</DropdownMenu>