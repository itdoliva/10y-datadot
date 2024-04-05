<script>
  // Store
  import { fproducts, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroupProduct from "$lib/components/dom/molecules/InputGroupProduct.svelte";

  export let parent
  export let nColumns = 1
</script>

<PanelItem icon="products" title="tipos de entrega">
  <InputGroupProduct
    parent={parent}
    categories={$categoriesEnriched.products}
    disabled={$isSwitchingLayout}
    {nColumns}
    bind:selected={$fproducts}
  />
</PanelItem>