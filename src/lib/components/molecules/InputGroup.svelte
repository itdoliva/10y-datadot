<script>
  import Button from "../atoms/Button.svelte";
  import PercentageBar from "../atoms/PercentageBar.svelte";
  export let categories
  export let selected = []
  export let multiselect = true
  export let visualElement = undefined

  export let direction = 'row'

</script>

<div class="input-group">
  <ul
    style:flex-direction={direction}
    style:gap={direction === 'row' ?  '1.25em' : '.5em'}
  >
    {#each categories as { id, alias, nNodes, pctNodes, color }}
      <li>

        <label>

          <div 
            class="input-wrapper"
            class:colorbullet={visualElement === 'colorBullet'}
            style:--color-bullet={visualElement === 'colorBullet' && color}
          >
            {#if multiselect}
              <input type="checkbox" value={id} bind:group={selected} />
            {:else}
              <input type="radio" value={id} bind:group={selected} />
            {/if}
            <span>{alias}</span>
          </div>


          {#if visualElement === 'pctBar'}
            <PercentageBar percentage={pctNodes}/>
          {/if}

        </label>

      </li>
    {/each}
  </ul>

  {#if multiselect}
  <div>
    <Button onClick={() => selected = []} disabled={selected.length === 0}>
      Selecionar tudo
    </Button>
  </div>
  {/if}
</div>

<style lang="scss">
  .input-group {
    display: flex;
    flex-direction: column;
    align-items: stretch;
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
          flex-direction: column;
          align-items: stretch;

          div.input-wrapper {
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: .6em;

            &.colorbullet::before {
              position: absolute;
              z-index: -1;
              content: '';
              width: 1.5em;
              height: 1.5em;
              background: var(--color-bullet);
              border-radius: 50%;
              transform: translate(calc(-50% + .4em), 0);
            }
          }
        }
      }
    }
  }

  

  
</style>