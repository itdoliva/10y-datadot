<script>
  export let onClick
  export let disabled = false
</script>

<button
  {disabled}
  on:click={onClick}
>
  <slot/>
</button>

<style>
  button {
    font-family: var(--font-family);
    font-size: var(--btn-font-size);
    font-weight: 300;

    text-transform: lowercase;
    text-decoration: underline;
    outline: none;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-accent);
  }

  button:not(:disabled):hover {
    font-family: inherit;
    font-weight: 600;
  }

  button:not(:disabled):active {
    font-family: inherit;
    font-weight: 600;
    color: #DCDEFE;
  }

  button:disabled {
    color: #DCDEFE;
    cursor: default;
  }
</style>