<script>
  // Store
  import { fdesigns, categoriesEnriched } from "$lib/stores/nodes";

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";
</script>

<PanelItem icon="designs" title="categorias de design">
  <InputGroup 
    gridlayout="design"
    categories={$categoriesEnriched.designs} 
    direction='column' 
    bind:selected={$fdesigns} 
  />
</PanelItem>