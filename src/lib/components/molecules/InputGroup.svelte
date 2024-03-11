<script>
  import { app, hoveredFilter } from '$lib/stores/canvas.js';
  import Button from "$lib/components/atoms/Button.svelte";
  import BarTween from "$lib/components/atoms/BarTween.svelte";
	import CheckIcon from '$lib/components/atoms/CheckIcon.svelte';
  import NumberTween from '$lib/components/atoms/NumberTween.svelte';
  import Graphics from '$lib/components/atoms/Graphics.svelte';
  import Bubble from '$lib/components/atoms/Bubble.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';
  import * as PIXI from "pixi.js";

  import templates from "$lib/templates"

  import castContainer from "$lib/actions/castContainer"

  export let categories
  export let selected = []
  export let multiselect = true
  export let unselectBtn = multiselect

  export let gridlayout = 'simple'

  export let direction = 'row'

  export let parent = undefined

</script>

<div class="input-group {direction} {gridlayout}">
  <ul class={gridlayout}>
    {#each categories as { id, name, alias, nNodes, pctNodes, color }, i}
    <!-- {@debug id, nNodes} -->
    {@const active = multiselect ? selected.includes(id) : selected === id}

      <li>

        <label 
          class:active={active}
          on:mouseenter={() => $hoveredFilter = id}
          on:mouseleave={() => $hoveredFilter = undefined}
        >

          <div class="check-wrapper">
            <CheckIcon 
              active={active} 
              hoveredFilter={$hoveredFilter === id} 
              backgroundColor={gridlayout === "goal" && color}
            />
          </div>


          {#if gridlayout === 'product'}
          {@const context = new PIXI.Container()}
            <div 
              class="icon-wrapper" 
              use:castContainer={{ parent, context }}
            >
              <Graphics context={context} blendmode="MULTIPLY" alpha=.9>
                <Bubble {id} {i} r={nNodes/3} />
              </Graphics>

              <Graphics context={context} drawFunc={templates[id]} />
            </div>
          {/if}


          {#if gridlayout === 'layout'}
            <div class="icon-wrapper">
              <Icon icon={id} />
            </div>
          {/if}


          <div class="label-wrapper">

            {#if multiselect}
              <input type="checkbox" value={id} bind:group={selected}/>
            {:else}
              <input type="radio" value={id} bind:group={selected}/>
            {/if}

            <span>{alias}</span>

          </div>


          {#if gridlayout === 'design'}
            <div class="bar-wrapper">
              <BarTween {i} number={pctNodes}/>
            </div>

            <div class="number-wrapper">
              <NumberTween {i} number={pctNodes} isPct={true} />
            </div>
          {/if}

        </label>

      </li>

    {/each}
  </ul>

  {#if unselectBtn}
    <div class="btn-wrapper">
      <Button onClick={() => selected = []} disabled={selected.length === 0}>
        selecionar tudo
      </Button>
    </div>
  {/if}
</div>

<style lang="scss">
  .input-group {
    display: grid;
    gap: 0;

    ul {
      display: grid;
    }

    label {
      font-size: var(--item-font-size);
      text-transform: lowercase;

      display: grid;
      align-items: center;
      column-gap: .4rem;
    

      &.active {
        .label-wrapper {
          font-weight: 500;
        }
      }
      
      .check-wrapper {
        grid-area: check;

        display: flex;
        justify-content: center;
        align-items: center;
      }

      .label-wrapper {
        grid-area: label;
      }

      .bar-wrapper {
        grid-area: bar;
      }

      .icon-wrapper {
        position: relative;
        grid-area: icon;
        height: 100%;
      }

      .number-wrapper {
        grid-area: num;
        text-align: right;
      }
    }

    input {
      display: none;
    }

  }

  .input-group.row {
    grid-auto-flow: column;
    margin-right: auto;

    ul {
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      gap: .25rem;
    }

    .btn-wrapper {
      align-self: end;
      display: flex;
    }

  }

  .input-group.column {
    grid-auto-flow: row;

    ul {
      grid-auto-flow: row;
      grid-auto-rows: min-content;
      gap: .4rem;
    }
  }

  .input-group.simple {
    label {
      grid-template-columns: min-content 1fr;
      grid-template-areas: "check label";
    }
  }

  .input-group.layout {
    ul {
      grid-auto-columns: min-content !important;
      gap: 2rem !important;
    }

    label {
      grid-template-columns: min-content min-content;
      grid-template-rows: 1.4rem 1fr;
      grid-template-areas: 
        "icon icon"
        "check label";
      row-gap: .4rem;
    }
  }

  .input-group.design {
    label {
      grid-template-columns: min-content 1fr 2rem;
      grid-template-rows: auto min-content;
      grid-template-areas: 
        "check label num"
        "bar bar num";
    }
  }

  .input-group.goal {
    label {
      grid-template-columns: min-content 1fr;
      grid-template-areas: "check label";
    }
  }

  .input-group.product {
    grid-auto-columns: max-content !important;

    ul {
      grid-auto-columns: 96px !important;
    }

    label {
      grid-template-rows: min-content 2.4rem auto;
      grid-template-areas: 
        "check"
        "icon"
        "label";

      .label-wrapper {
        text-align: center;
      }

      .check-wrapper {
        align-self: center;
      }
    }

    .btn-wrapper {
      align-self: start !important;
      padding-top: calc(2.4rem + 10px);
    }
  }

 
</style>