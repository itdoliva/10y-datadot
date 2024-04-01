<script>
  // Store
  import { findustries } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import Beeswarm from "$lib/components/dom/organisms/Beeswarm.svelte";
</script>

<PanelItem icon="industries" title="setores do mercado">
  <Beeswarm 
    disabled={$isSwitchingLayout}
    bind:selected={$findustries} 
  />
</PanelItem>