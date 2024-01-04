<script>
  export let categories
  export let selected = []

  export let direction = 'row'

</script>

<ul
  style:flex-direction={direction}
>
  {#each categories as { id, alias }}
    <li>
      <label>
        <input type="checkbox" value={id} bind:group={selected} />
        {alias}
      </label>
    </li>
  {/each}
</ul>

{#if selected.length > 0}
  <button on:click={() => selected = []}>
    Selecionar tudo
  </button>
{/if}

<style>
  ul {
    display: flex;
  }
</style>