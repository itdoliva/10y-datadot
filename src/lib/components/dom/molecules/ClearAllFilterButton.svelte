<script>
  // Stores
  import { fyears, fdesigns, fgoals, findustries, fproducts } from "$lib/stores/nodes";

  // DOM Components
  import Button from "$lib/components/dom/atoms/Button.svelte";

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

<Button {disabled} onClick={clearFilters}>
  X 
  <span style:text-decoration="underline">LIMPAR FILTROS</span>
</Button>