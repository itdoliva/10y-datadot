<script>
  export let onClick
  export let disabled = false
</script>

<button
  {disabled}
  on:click={onClick}
>
  {#if $$slots.text}
    <slot />
    <span><slot name="text"/></span>
  {:else}
    <span><slot /></span>
	{/if}
  
</button>

<style lang="scss">
  button {
    width: 100%;
    height: 100%;
    padding: 0;


    display: flex;
    align-items: center;
    gap: .2rem;


    font-family: var(--font-family);
    font-size: var(--btn-font-size);
    font-weight: 300;

    outline: none;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-accent);

    span {
      font-family: inherit;
      font-weight: inherit;

      text-decoration: underline;
      
      white-space: nowrap;
    }
  }

  button:not(:disabled):hover {
    font-weight: 600;
  }

  button:not(:disabled):active {
    font-weight: 600;
    color: #DCDEFE;
  }

  button:disabled {
    color: #DCDEFE;
    cursor: default;
  }
</style>