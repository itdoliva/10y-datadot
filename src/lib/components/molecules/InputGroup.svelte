<script>
  import { hovered } from '$lib/store/canvas.js';
  import Button from "../atoms/Button.svelte";
  import BarTween from "../atoms/BarTween.svelte";
	import CheckIcon from './../atoms/CheckIcon.svelte';
  import NumberTween from '../atoms/NumberTween.svelte';
  import Circle from '../atoms/Circle.svelte';

  export let categories
  export let selected = []
  export let multiselect = true
  export let visualElement = undefined

  export let gridlayout = 'layout'

  export let direction = 'row'

</script>

<div class="input-group">
  <ul
    style:flex-direction={direction}
    style:gap={direction === 'row' ?  '1.25em' : '.5em'}
  >
    {#each categories as { id, alias, nNodes, pctNodes, color }}
    {@const active = multiselect ? selected.includes(id) : selected === id}
      <li>

        <label 
          class={gridlayout}
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

            <CheckIcon {active} />
          </div>

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
  }


  ul {
      display: flex;

      li {
        display: flex;
        flex-direction: column;
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
        font-weight: 600;
      }
    }
    
    &.layout {
      grid-template-columns: min-content 1fr;
      grid-template-rows: min-content 1fr;
      grid-template-areas: 
        "icon icon"
        "check label";
    }

    &.design {
      grid-template-columns: min-content 1fr 2rem;
      grid-template-rows: auto min-content;
      grid-template-areas: 
        "check label num"
        "bar bar num";
    }

    &.goal {
      grid-template-columns: min-content 1fr;
      grid-template-areas: "check label";
    }

    &.product {
      grid-template-rows: min-content min-content auto;
      grid-template-areas: 
        "check"
        "icon"
        "label";

      .label-wrapper {
        text-align: center;
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

    .number-wrapper {
      grid-area: num;
      text-align: right;
    }



    // div.input-wrapper {
    //   position: relative;
    //   display: flex;
    //   flex-direction: row;
    //   align-items: center;
    //   gap: .6em;

    //   &.colorbullet::before {
    //     position: absolute;
    //     z-index: -1;
    //     content: '';
    //     width: 1.5em;
    //     height: 1.5em;
    //     background: var(--color-bullet);
    //     border-radius: 50%;
    //     transform: translate(calc(-50% + .4em), 0);
    //   }
    // }
  }

  

  
</style>