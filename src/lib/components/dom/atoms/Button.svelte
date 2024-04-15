<script>
  export let onClick
  export let disabled = false
</script>

<button 
  class="clean-btn"
  disabled={disabled} 
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

    color: var(--clr-accent);

    white-space: nowrap;

    cursor: pointer;

    &:not(:disabled) {
      // &:active,
      // &:hover {
      //   font-weight: 600;
      // }

      &:active {
        color: #DCDEFE;
      }
    }

    &:disabled {
      color: #DCDEFE;
      cursor: default;
    }
  }

</style>