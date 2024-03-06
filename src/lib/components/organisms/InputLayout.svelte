<script>
  // Components
	import PanelItem from '$lib/components/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/molecules/InputGroup.svelte";

  export let layout
  
  const layoutCategories = [
    { alias: "Block", id: "block" },
    { alias: "Radial", id: "radial" },
  ]

</script>

<PanelItem icon="layouts" title="visualizar como">
  <InputGroup 
    gridlayout="layout"
    categories={layoutCategories} 
    multiselect={false} 
    bind:selected={layout}
  />
</PanelItem>