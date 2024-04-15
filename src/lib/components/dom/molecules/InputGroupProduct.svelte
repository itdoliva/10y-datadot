<script>
  // Libraries
  import * as PIXI from "pixi.js"

  // Actions
  import castContainer from "$lib/actions/castContainer";

  // Stores
  import { hoveredFilter } from '$lib/stores/canvas.js';
  import { nodeSize } from '$lib/stores/nodes.js';

  // DOM Components
	import CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';
  import ClearFilterButton from '$lib/components/dom/molecules/ClearFilterButton.svelte';

  // WebGL Components
  import Graphics from '$lib/components/webgl/atoms/Graphics.svelte';
  import Bubble from '$lib/components/webgl/atoms/Bubble.svelte';
  
  // Templates
  import templates from "$lib/templates"


  export let categories
  export let selected = []
  export let disabled = false
  export let nColumns = 1

  export let parent = undefined

  // +1 for unselect btn
  $: itemsByColumn = Math.ceil((categories.length + 1)/nColumns)
  
</script>

<div 
  class="container"
  class:bubble={!!parent}
>

  <ul class="input-group" 
    style:--n-columns={nColumns}
    style:--items-by-column={itemsByColumn}
  >
    {#each categories as { id, alias, nNodes }, i}
    {@const active = selected.includes(id)}

      <li class="input-group__item" 
        class:active={active}
      >

        <label class="item"
          on:mouseenter={() => hoveredFilter.set(id)}
          on:mouseleave={() => hoveredFilter.set()}
        >

          <div class="item__check">
            <CheckIcon 
              active={active} 
              hoveredFilter={$hoveredFilter === id} 
            />
          </div>

          {#if parent !== undefined}
            {@const context = new PIXI.Container()}
            {@const r = (nNodes/(3*20)*$nodeSize)}
            <div class="item__bubble"
              use:castContainer={{ parent, context }}
            >

              <Graphics context={context} blendmode="MULTIPLY" alpha=.9>
                <Bubble {id} {i} {r} />
              </Graphics>

              <Graphics context={context} drawFunc={templates[id]} />

            </div>
          {/if}

          <div class="item__label">
            <input type="checkbox" value={id} {disabled} bind:group={selected}/>
            <p>{alias}</p>
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
    // display: grid;
    // grid-auto-flow: row;
    // gap: 0;

    .input-group {
      display: grid;
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
          grid-template-rows: auto;
          grid-template-areas: "check label";
          align-items: center;

          column-gap: .4rem;

          &__check { grid-area: check; }
          &__label { grid-area: label; }
          &__bubble { grid-area: bubble; }

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

    &.bubble {
      .input-group {
        grid-auto-flow: column;
        grid-template-rows: max-content;
        grid-template-columns: none;
        grid-auto-columns: calc(8.6*var(--fs-label));

        column-gap: calc(.8*var(--fs-label));

        &__item {
          .item {
            grid-template-columns: 100%;
            grid-template-rows: 0 calc(4.2*var(--fs-label)) auto;
            grid-template-areas: 
              "check"
              "bubble"
              "label";

            &__label {
              p {
                text-align: center;
              }
            }
          }
        }

        &__unselect-btn {
          padding-top: calc(4.2*var(--fs-label));
        }
      }

    }


  }

  input {
    display: none;
  }
 
</style>