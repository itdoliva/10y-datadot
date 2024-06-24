<script>
  import { getContext } from 'svelte';
  import { _ } from 'svelte-i18n'

  // Stores
  import { hoveredFilter } from '$lib/stores/canvas.js';

  // DOM Components
  import ClearFilterButton from "$lib/components/dom/molecules/ClearFilterButton.svelte";
  import BarTween from "$lib/components/dom/atoms/BarTween.svelte";
	import CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';
  import NumberTween from '$lib/components/dom/atoms/NumberTween.svelte';

  export let categories
  export let selected = []
  export let multiselect = true
  export let unselectBtn = multiselect
  export let disabled = false
  export let onDark = false
  export let i18nPrefix = ""

  export let gridlayout = 'simple'

  export let direction = 'row'

  const { theme } = getContext("item-theme")



</script>

<div class="container {gridlayout} {direction} {theme}">

  <ul class="input-group">
    {#each categories as { id, pctNodes }, i}
    {@const active = multiselect ? selected.includes(id) : selected === id}

      <li class="input-group__item" class:active={active}>

        <label class="item"
          on:mouseenter={() => $hoveredFilter = id}
          on:mouseleave={() => $hoveredFilter = undefined}
        >

          <div class="item__check">
            <CheckIcon 
              onDark={onDark || theme === "on-dark"}
              active={active} 
              hoveredFilter={$hoveredFilter === id} 
            />
          </div>


          <div class="item__label">
          {#if multiselect}
            <input type="checkbox" value={id} {disabled} bind:group={selected}/>
          {:else}
            <input type="radio" value={id} {disabled} bind:group={selected}/>
          {/if}
            <span class:on-dark={onDark}>{$_(i18nPrefix + id)}</span>
          </div>


          {#if gridlayout === 'design'}
            <div class="item__bar">
              <BarTween {i} number={pctNodes}/>
            </div>

            <div class="item__number">
              <NumberTween number={pctNodes} isPct={true} />
            </div>
          {/if}

        </label>

      </li>

    {/each}

    {#if unselectBtn}
      <li class="input-group__unselect-btn">
        <ClearFilterButton 
          onClick={() => selected = []} 
          disabled={selected.length === 0} 
        />
      </li>
    {/if}

  </ul>

</div>

<style lang="scss">
  .container {
    display: grid;
    gap: 0;

    width: 100%;

    &.on-dark {
      .input-group {
        &__item {
          .item {
            &__label {
              input:checked + span {
                font-weight: 700;
                color: var(--clr-accent);
              }

            }
          }
        }
      }
    }

    .input-group {
      display: grid;

      &__item {
        .item {
          font-size: var(--fs-label);
          text-transform: lowercase;

          display: grid;
          align-items: center;
          column-gap: .4rem;
        
          &__check { grid-area: check; }
          &__label { grid-area: label; }
          &__icon { grid-area: icon; }
          &__bar { grid-area: bar; }
          &__number { grid-area: num; }

          &__check {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          &__icon {
            position: relative;
            height: 100%;
          }

          &_number {
            text-align: right;
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

    &.row {
      grid-auto-flow: column;
      margin-right: auto;

      .input-group {
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        gap: .25rem;

        &__unselect-btn {
          align-self: end;
          display: flex;
        }
      }
    }

    &.column {
      grid-auto-flow: row;
      grid-template-columns: max-content;

      .input-group {
        grid-auto-flow: row;
        grid-auto-rows: min-content;
        gap: .4rem;
      }
    }

    &.simple {
      .input-group {
        &__item {
          .item {
            grid-template-columns: min-content 1fr;
            grid-template-areas: "check label";
          }
        }
      }
    }

    &.design {
      grid-template-columns: none;
      .input-group {
        &__item {
          .item {
            grid-template-columns: min-content 1fr 2rem;
            grid-template-rows: auto min-content;
            grid-template-areas: 
              "check label num"
              "bar bar num";
          }
        }
      }
    }

    &.product {
      grid-auto-columns: max-content !important;

      .input-group {
        grid-auto-columns: 96px !important;

        &__item {
          .item {
            grid-template-rows: min-content 2.4rem auto;
            grid-template-areas: 
              "check"
              "icon"
              "label";

            .item__label {
              text-align: center;
            }

            .item__check {
              align-self: center;
            }
          }
        }

        &__unselect-btn {
          align-self: start !important;
          padding-top: calc(2.4rem + 10px);
        }
      }
    }


  }

  input {
    display: none;
  }


 
</style>