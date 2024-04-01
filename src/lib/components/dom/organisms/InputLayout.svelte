<script>
  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";

  import { isSwitchingLayout } from "$lib/stores/canvas"

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
    disabled={$isSwitchingLayout}
    bind:selected={layout}
  />
</PanelItem>