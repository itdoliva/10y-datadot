<script>
  import Icon from "$lib/components/dom/atoms/Icon.svelte";

  let active = false
</script>

<button on:click={() => active = !active} class:active>
  <Icon icon={active ? "pause" : "play"} />
  <span>play my vis!</span>
  <Icon icon="wireless" />
</button>

<style lang="scss">
  button {
    width: 100%;
    height: 100%;

    display: grid;
    grid-template-columns: 1rem 1fr 1rem;
    align-items: center;
    gap: .6rem;
    padding: 0 1rem;

    outline: none;
    border: none;

    font-size: .75rem;
    font-weight: 600;
    font-style: italic;

    cursor: pointer;

    background: black;
    fill: var(--color-accent);
    color: var(--color-accent);

    &.active {
      background: var(--color-accent);
      fill: black;
      color: black;
    }

    &:not(.active):hover {
      background: black;
      fill: var(--color-accent-low);
      color: var(--color-accent-low);
    }

  }

  span {
    white-space: nowrap;
  }
</style>