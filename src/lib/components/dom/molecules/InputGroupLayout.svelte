<script>
  // Store
  import { hoveredFilter } from '$lib/stores/canvas.js';

  // DOM Components
	import CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';
  import Icon from '$lib/components/dom/atoms/Icon.svelte';


  export let selected = []
  export let disabled = false
  export let direction = 'column'

  const categories = [
    { alias: "Block", id: "block" },
    { alias: "Radial", id: "radial" },
  ]


</script>

<div class="container {direction}">

  <ul class="input-group">

    {#each categories as { id, alias }}
    {@const active = selected === id}

      <li class="input-group__item" class:active={active}>

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

          <div class="item__icon">
            <Icon icon={id} />
          </div>

          <div class="item__label">
            <input type="radio" value={id} {disabled} bind:group={selected}/>
            <span>{alias}</span>
          </div>

        </label>

      </li>

    {/each}

  </ul>

</div>

<style lang="scss">
  .container {
    display: grid;
    gap: 0;

    .input-group {
      display: grid;

      &__item {

        .item {
          font-size: var(--fs-label);
          text-transform: lowercase;
          overflow: hidden;


          display: grid;
            
          align-items: center;
          row-gap: .4rem;
          column-gap: .4rem;

          &__check { grid-area: check; }
          &__icon { grid-area: icon; }
          &__label { grid-area: label; }
        
          &__check {
            grid-area: check;

            display: flex;
            justify-content: center;
            align-items: center;
          }

          &__icon {
            position: relative;
            height: 100%;
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
      grid-auto-flow: row;

      .input-group {
        grid-auto-flow: column;
        grid-auto-columns: min-content;
        gap: .6rem;

        &__item {

          .item {
            grid-template-columns: calc(var(--fs-label)*1.8) min-content min-content;
            grid-template-areas: 
              "icon check label";
              
            align-items: center;
            row-gap: .4rem;
            column-gap: .4rem;
          }
        }
      }
    }

    &.column {
      grid-auto-flow: column;
      grid-auto-columns: min-content !important;

      gap: 2rem !important;

      margin-right: auto;

      .input-group {
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        gap: calc(1.2*var(--fs-label));

        &__item {
          .item {
            grid-template-columns: min-content min-content;
            grid-template-rows: 1.4rem 1fr;
            grid-template-areas: 
              "icon icon"
              "check label";
          }
        }
      }
    }


  }

  input {
    display: none;
  }


 
</style>