<script>
  // Store
  import { fgoals, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroup from "$lib/components/dom/molecules/InputGroup.svelte";
</script>

<PanelItem icon="goals" title="objetivos do projeto">
  <InputGroup 
    gridlayout="goal"
    categories={$categoriesEnriched.goals} 
    direction='column' 
    disabled={$isSwitchingLayout}
    bind:selected={$fgoals} 
  />
</PanelItem>