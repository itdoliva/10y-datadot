<script>
  import { setContext } from 'svelte';
  import { _ } from 'svelte-i18n'

  // Store
  import { fproducts, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroupProduct from "$lib/components/dom/molecules/InputGroupProduct.svelte";

  export let parent = undefined
  export let nColumns = 1

  export let theme = "on-light"

  setContext("item-theme", { theme })

</script>

<PanelItem icon="products" title={$_("input.product")}>
  <InputGroupProduct
    parent={parent}
    categories={$categoriesEnriched.filter(d => d.type === "product")}
    disabled={$isSwitchingLayout}
    {nColumns}
    bind:selected={$fproducts}
  />
</PanelItem>