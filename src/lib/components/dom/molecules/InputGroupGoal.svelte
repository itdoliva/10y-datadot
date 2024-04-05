<script>
  // Actions
  import { hoveredFilter } from '$lib/stores/canvas.js';

  // DOM Components
  import Button from "$lib/components/dom/atoms/Button.svelte";
	import CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';
  import ClearFilterButton from '$lib/components/dom/molecules/ClearFilterButton.svelte';
  
  export let categories
  export let selected = []
  export let disabled = false
  export let nColumns = 1

</script>

<div class="container">

  <ul class="input-group" 
    style:--n-columns={nColumns}
    style:--items-by-column={Math.ceil(categories.length/nColumns)}
  >
    {#each categories as { id, alias, color }}
    {@const active = selected.includes(id)}

      <li class="input-group__item" class:active={active}>

        <label class="item"
          on:mouseenter={() => hoveredFilter.set(id)}
          on:mouseleave={() => hoveredFilter.set()}
        >

          <div class="item__check">
            <CheckIcon 
              active={active} 
              hoveredFilter={$hoveredFilter === id} 
              backgroundColor={color}
            />
          </div>

          <div class="item__label">
            <input type="checkbox" value={id} {disabled} bind:group={selected}/>
            <span>{alias}</span>
          </div>

        </label>

      </li>

    {/each}

    <li class="input-group__unselect-btn">
      <ClearFilterButton 
        onClick={() => selected = []} 
        disabled={selected.length === 0} 
      />
    </li>
  </ul>

</div>

<style lang="scss">
  .container {
    display: grid;
    grid-auto-flow: row;
    gap: 0;

    .input-group {
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(var(--items-by-column), auto);
      grid-template-columns: repeat(var(--n-columns), 1fr);

      align-items: start;

      column-gap: .8rem;
      row-gap: .4rem;

      columns: var(--n-columns);
      -webkit-columns: var(--n-columns);
      -moz-columns: var(--n-columns);

      &__item {

        .item {
          font-size: var(--fs-label);
          text-transform: lowercase;

          display: grid;
          grid-template-columns: min-content 1fr;
          grid-template-areas: "check label";
          align-items: center;

          column-gap: .4rem;

          &__check { grid-area: check; }
          &__label { grid-area: label; }

          &__check {
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }

      &.active {
        .item {
          &__label {
            font-weight: 500;
          }
        }
      }
      }
    }

  }

  input {
    display: none;
  }
 
</style>