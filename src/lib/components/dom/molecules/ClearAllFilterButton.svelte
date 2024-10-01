<script>
  import { _ } from 'svelte-i18n'

  import ClearFilterButton from './ClearFilterButton.svelte';

  // Stores
  import { fyears, fdesigns, fgoals, findustries, fproducts } from "$lib/stores/nodes";

  $: disabled = (
    ($fdesigns.length + $fgoals.length + $findustries.length + $fproducts.length) === 0 &&
    (
      (!$fyears) || 
      ($fyears.length === 2 && $fyears[0] === 2014 && $fyears[1] === 2023)
    )
  )
  
  function clearFilters() {
    fyears.set([ 2014, 2023 ])
    fdesigns.set([])
    fgoals.set([])
    findustries.set([])
    fproducts.set([])
  }

</script>

<ClearFilterButton uppercase={true} onClick={clearFilters} {disabled}>
  X&nbsp;<span class="font-inherit underline">{$_("menu.unselect-all")}</span>
</ClearFilterButton>