<script>
  // Store
  import { findustries } from "$lib/stores/nodes";

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import Beeswarm from "$lib/components/dom/organisms/Beeswarm.svelte";
</script>

<PanelItem icon="industries" title="setores do mercado">
  <Beeswarm 
    bind:selected={$findustries} 
  />
</PanelItem>