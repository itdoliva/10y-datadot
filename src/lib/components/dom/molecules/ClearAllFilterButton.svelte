<script>
  import { _ } from 'svelte-i18n'

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

<Button {disabled} onClick={clearFilters}
  colorDefault="var(--clr-accent)"
  colorActive="var(--clr-accent)"
  colorHover="var(--clr-accent)"
  colorDisabled="var(--clr-accent-low)"
>
  <div class:disabled={disabled}>
    <p style:text-transform="uppercase">
      X 
      <span style:text-decoration="underline">{$_("menu.unselect-all")}</span>
    </p>
  </div> 
  
</Button>

<style lang="scss">
  div {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: center;
    align-items: center;

    p {
      span {
        font-weight: inherit;
      }
    }

    &:not(.disabled):hover {

      p {
        font-weight: 700;
      }
    }
  }
</style>