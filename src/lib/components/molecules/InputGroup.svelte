<script>
  import Button from "../atoms/Button.svelte";
  export let categories
  export let selected = []
  export let multiselect = true

  export let direction = 'row'

</script>

<div class="input-group">
  <ul
    style:flex-direction={direction}
    style:gap={direction === 'row' ?  '1.25em' : '.2em'}
  >
    {#each categories as { id, alias }}
      <li>
        <label>
          {#if multiselect}
            <input type="checkbox" value={id} bind:group={selected} />
          {:else}
            <input type="radio" value={id} bind:group={selected} />
          {/if}
          {alias}
        </label>
      </li>
    {/each}
  </ul>

  {#if multiselect}
    <Button onClick={() => selected = []} disabled={selected.length === 0}>
      Selecionar tudo
    </Button>
  {/if}
</div>

<style lang="scss">
  .input-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: .6rem;

    ul {
      display: flex;

      li {
        display: flex;
        flex-direction: column;


        label {
          font-size: var(--item-font-size);
          text-transform: lowercase;

          display: flex;
          flex-direction: row;
          align-items: center;
          gap: .4em;
        }
      }
    }
  }

  

  
</style>