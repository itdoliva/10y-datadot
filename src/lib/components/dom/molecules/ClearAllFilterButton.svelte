<script>
  import { _ } from 'svelte-i18n'
  import { yearRange } from "$lib/stores/nodes";

  import ClearFilterButton from './ClearFilterButton.svelte';

  // Stores
  import { fyears, fdesigns, fgoals, findustries, fproducts } from "$lib/stores/nodes";

  $: disabled = (
    ($fdesigns.length + $fgoals.length + $findustries.length + $fproducts.length) === 0 &&
    (
      (!$fyears) || 
      ($fyears.length === 2 && $fyears[0] === $yearRange[0] && $fyears[1] === $yearRange[1])
    )
  )
  
  function clearFilters() {
    fyears.set($yearRange)
    fdesigns.set([])
    fgoals.set([])
    findustries.set([])
    fproducts.set([])
  }

</script>

<ClearFilterButton uppercase={true} onClick={clearFilters} {disabled}>
  X&nbsp;<span class="font-inherit underline">{$_("menu.unselect-all")}</span>
</ClearFilterButton>