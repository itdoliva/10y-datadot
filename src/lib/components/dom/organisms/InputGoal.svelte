<script>
  // Store
  import { fgoals, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroupGoal from "$lib/components/dom/molecules/InputGroupGoal.svelte";

  export let nColumns = 1

</script>

<PanelItem icon="goals" title="objetivos do projeto">
  <InputGroupGoal 
    categories={$categoriesEnriched.goals} 
    disabled={$isSwitchingLayout}
    {nColumns}
    bind:selected={$fgoals} 
  />
</PanelItem>