<script>
  import { hovered } from '$lib/store/canvas.js';
  import Button from "../atoms/Button.svelte";
  import BarTween from "../atoms/BarTween.svelte";
	import CheckIcon from './../atoms/CheckIcon.svelte';
  import NumberTween from '../atoms/NumberTween.svelte';
  import Circle from '../atoms/Circle.svelte';
  import Container from '../atoms/Container.svelte';
  import Graphics from '../atoms/Graphics.svelte';
  import Bubble from '../atoms/Bubble.svelte';
  import Icon from '../atoms/Icon.svelte';

  import templates from "$lib/templates"

  export let categories
  export let selected = []
  export let multiselect = true

  export let gridlayout = 'layout'

  export let direction = 'row'

</script>

<div class="input-group {direction} {gridlayout}">
  <ul class={gridlayout}>
    {#each categories as { id, name, alias, nNodes, pctNodes, color }}
    {@const active = multiselect ? selected.includes(id) : selected === id}
      <li>

        <label 
          class:active={active}
          on:mouseenter={() => $hovered = id}
          on:mouseleave={() => $hovered = undefined}
        >
          <div class="check-wrapper">
            {#if gridlayout === "goal"}
              <div class="circle-wrapper">
                <Circle fill={color} number=1 range={[0, 8]} />
              </div>
            {/if}

            <CheckIcon active={active} hovered={$hovered === id} />
          </div>

          {#if gridlayout === 'product'}
            <div class="icon-wrapper">
              <Container>
                <Graphics blendmode="MULTIPLY" alpha=.9>
                  <Bubble {id} r={nNodes/3} />
                </Graphics>

                <Graphics drawFunc={templates[id]} />
              </Container>
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
              <BarTween number={pctNodes}/>
            </div>

            <div class="number-wrapper">
              <NumberTween number={pctNodes} isPct={true} />
            </div>
          {/if}

        </label>

      </li>
    {/each}
  </ul>

  {#if multiselect}
    <div class="btn-wrapper">
      <Button onClick={() => selected = []} disabled={selected.length === 0}>
        Selecionar tudo
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

    &.layout {
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

    &.design {
      label {
        grid-template-columns: min-content 1fr 2rem;
        grid-template-rows: auto min-content;
        grid-template-areas: 
          "check label num"
          "bar bar num";
      }
    }

    &.goal {
      label {
        grid-template-columns: min-content 1fr;
        grid-template-areas: "check label";
      }
    }

    &.product {
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
      }

      .btn-wrapper {
        align-self: start !important;
        padding-top: calc(2.4rem + 10px);
      }
    }


    &.row {
      grid-auto-flow: column;
      margin-right: auto;

      ul {
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        gap: .25rem;
      }

      .btn-wrapper {
        // grid-column: 1;
        align-self: end;

        display: flex;
      }

    }

    &.column {
      grid-auto-flow: row;

      ul {
        grid-auto-flow: row;
        grid-auto-rows: min-content;
        gap: .4rem;
      }
    }
  }

  input {
    display: none;
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
      
      position: relative;
      display: flex;
      align-items: center;

      justify-self: center;

      .circle-wrapper {
        position: absolute;
        pointer-events: none;

        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        z-index: -1;
      }
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



  

  
</style>