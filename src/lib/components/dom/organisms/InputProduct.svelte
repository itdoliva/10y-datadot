<script>
  // Store
  import { fproducts, categoriesEnriched } from "$lib/stores/nodes";

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";

  export let parent
</script>

<PanelItem icon="products" title="tipos de entrega">
  <InputGroup
    parent={parent}
    gridlayout="product"
    categories={$categoriesEnriched.products}
    bind:selected={$fproducts}
  />
</PanelItem>