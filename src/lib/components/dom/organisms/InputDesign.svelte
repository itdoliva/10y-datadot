<script>
  import { _ } from 'svelte-i18n'

  // Store
  import { fdesigns, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";

  $: categories = $categoriesEnriched.designs.map(d => ({
    ...d,
    alias: $_(d.alias)
  }))

</script>

<PanelItem icon="designs" title={$_("input.design")}>
  {#if categories}
  <InputGroup 
    gridlayout="design"
    categories={categories} 
    direction='column' 
    disabled={$isSwitchingLayout}
    bind:selected={$fdesigns} 
  />
  {/if}
</PanelItem>