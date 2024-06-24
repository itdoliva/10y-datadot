<script>
  import { setContext } from 'svelte';
  import { _ } from 'svelte-i18n'

  // Store
  import { fdesigns, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";

  export let theme = "on-light"

  setContext("item-theme", { theme })

</script>

<PanelItem icon="designs" title={$_("input.design")}>
  <InputGroup 
    gridlayout="design"
    categories={$categoriesEnriched.filter(d => d.type === "design")} 
    direction='column' 
    i18nPrefix="category."
    disabled={$isSwitchingLayout}
    bind:selected={$fdesigns} 
  />
</PanelItem>