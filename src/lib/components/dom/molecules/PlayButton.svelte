<script>
  // DOM Elements
  import Button from "$lib/components/dom/atoms/Button.svelte";
  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  

  let active = false

  function onClick() {
    active = !active
  }
</script>

<Button {onClick}>
  <div class="container" class:active>
    <Icon icon={active ? "pause" : "play"} />
    <span>play my vis!</span>
    <Icon icon="wireless" />
  </div>
</Button>

<style lang="scss">

  .container {
    --icn-width: calc(var(--fs-label)*1.5);

    width: 100%;
    height: 100%;

    padding: 0 1rem;

    display: grid;
    grid-template-columns: var(--icn-width) min-content var(--icn-width);
    align-items: center;
    gap: .6rem;

    font-size: var(--fs-label);
    font-weight: 600;
    font-style: italic;

    background: var(--clr-black);
    fill: var(--clr-accent);
    color: var(--clr-accent);

    &.active {
      background: var(--clr-accent);
      fill: var(--clr-black);
      color: var(--clr-black);
    }

    &:not(.active) {
      &.hover {
        background: var(--clr-black);
        fill: var(--clr-accent-low);
        color: var(--clr-accent-low);
      }
    }
    
  }

</style>