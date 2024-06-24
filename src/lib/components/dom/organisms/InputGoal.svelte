<script>
  import { setContext } from 'svelte';
  import { _ } from 'svelte-i18n'

  // Store
  import { fgoals, categoriesEnriched } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroupGoal from "$lib/components/dom/molecules/InputGroupGoal.svelte";

  export let nColumns = 1
  export let theme = "on-light"

  setContext("item-theme", { theme })

</script>

<PanelItem icon="goals" title={$_("input.goal")}>
  <InputGroupGoal 
    categories={$categoriesEnriched.filter(d => d.type === "goal")} 
    disabled={$isSwitchingLayout}
    {nColumns}
    bind:selected={$fgoals} 
  />
</PanelItem>