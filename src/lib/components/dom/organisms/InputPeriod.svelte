<script>
  // Store
  import { fyears } from "$lib/stores/nodes";
  import { isSwitchingLayout } from "$lib/stores/canvas"

  // Components
	import PanelItem from '$lib/components/dom/molecules/PanelItem.svelte';
  import YearSliderPicker from "$lib/components/dom/organisms/YearSliderPicker.svelte";
</script>

<PanelItem icon="period" title="período">
  <YearSliderPicker 
    disabled={$isSwitchingLayout}
    min={2014} 
    max={2023} 
    bind:selected={$fyears} 
  />
</PanelItem>