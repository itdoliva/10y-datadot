<script>
  import { _ } from 'svelte-i18n'

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import InputGroupLayout from "$lib/components/dom/molecules/InputGroupLayout.svelte";

  import { isSwitchingLayout } from "$lib/stores/canvas"

  export let layout
  export let direction = "column"
  
</script>

<PanelItem icon="layouts" title={$_("input.layout")} {direction}>

  <InputGroupLayout 
    {direction}
    disabled={$isSwitchingLayout}
    bind:selected={layout}
  />

</PanelItem>