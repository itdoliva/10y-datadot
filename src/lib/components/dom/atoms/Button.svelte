<script>
  export let onClick
  export let disabled = false

  export let colorDefault = "var(--clr-accent)"
  export let colorActive = "var(--clr-white)"
  export let colorHover = "var(--clr-white)"
  export let colorDisabled = "var(--clr-gray)"
</script>

<button 
  class="clean-btn"
  disabled={disabled}
  style:--clr-default={colorDefault}
  style:--clr-active={colorActive}
  style:--clr-hover={colorHover}
  style:--clr-disabled={colorDisabled}
  on:click={onClick}
>
  <slot />
</button>

<style lang="scss">
  button {
    width: 100%;
    height: 100%;
    padding: 0;

    display: flex;
    align-items: center;
    gap: .2rem;

    font-family: var(--ff-general);
    font-size: var(--fs-btn);
    font-weight: 300;

    color: var(--clr-default);

    white-space: nowrap;

    cursor: pointer;

    &:not(:disabled) {
      &:active {
        color: var(--clr-active) !important;
      }

      &:hover {
        color: var(--clr-hover);
      }
    }

    &:disabled {
      color: var(--clr-disabled);
    }
  }

</style>