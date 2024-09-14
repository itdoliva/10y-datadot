<script>
  import { setContext } from 'svelte';
  import { _ } from 'svelte-i18n'

  // Store
  import { findustries } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import Beeswarm from "$lib/components/dom/organisms/BeeswarmAlt.svelte";
  
  export let theme = "on-light"

  setContext("item-theme", { theme })
</script>

<PanelItem icon="industries" title={$_("input.industry")}>
  <Beeswarm 
    disabled={$isSwitchingLayout}
    bind:selected={$findustries} 
  />
</PanelItem>