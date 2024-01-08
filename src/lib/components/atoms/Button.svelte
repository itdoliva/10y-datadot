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
    font-size: 8px;
    text-transform: uppercase;
    outline: none;
    background: none;
    border-radius: .2em;
    padding: .5em 1em;
    color: rgb(125, 125, 125);
    border: 1px solid rgb(125, 125, 125);
  }

  button:not(:disabled):hover {
    border: 1px solid black;
    color: black;
  }

  button:disabled {
    color: rgb(220, 220, 220);
    border: 1px solid transparent;
  }
</style>