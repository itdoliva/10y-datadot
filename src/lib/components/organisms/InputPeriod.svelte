<script>
  // Store
  import { fyears } from "$lib/stores/nodes";

  // Components
	import PanelItem from '$lib/components/molecules/PanelItem.svelte';
  import YearSliderPicker from "$lib/components/organisms/YearSliderPicker.svelte";
</script>

<PanelItem icon="period" title="período">
  <YearSliderPicker 
    min={2014} 
    max={2023} 
    bind:selected={$fyears} 
  />
</PanelItem>