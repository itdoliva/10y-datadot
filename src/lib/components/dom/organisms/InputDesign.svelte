<script>
  // Store
  import { fdesigns, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";
</script>

<PanelItem icon="designs" title="categorias de design">
  <InputGroup 
    gridlayout="design"
    categories={$categoriesEnriched.designs} 
    direction='column' 
    disabled={$isSwitchingLayout}
    bind:selected={$fdesigns} 
  />
</PanelItem>