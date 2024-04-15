<script>
  export let active = false
  export let hoveredFilter = false
  export let onDark = false

  export let backgroundColor = undefined

  let size
  
</script>

<div class="container check-icon" bind:clientWidth={size}>
  {#if size}
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 {size} {size}"
      class:active={active}
      class:hovered={!active && hoveredFilter}
      class:on-dark={onDark}
    >

      <g class="check" transform="translate({size/2}, {size/2})">

        {#if backgroundColor}
          <circle class="check__goal" fill={backgroundColor} />
        {/if}

        <circle class="check__point" />
        <circle class="check__main" />

        {#if active}
          <line class="check__minus" x1={-size*.35} x2={size*.35} y1=0 y2=0 />
        {/if}

      </g>

    </svg>
  {/if}
</div>

<style lang="scss">
  .container {
    width: var(--fs-label);
    display: flex;
    flex-direction: center;
    align-items: center;

    svg {
      --clr-outline: var(--clr-black);
      --clr-fill-selected: var(--clr-black);
      --clr-fill-hover: var(--clr-accent);
      --clr-minus: var(--clr-accent);

      width: 100%;
      aspect-ratio: 1;
  
      margin: 0 auto;
      padding: 0;
      
      overflow: visible;

      &.on-dark {
        --clr-outline: var(--clr-accent);
        --clr-fill-selected: var(--clr-accent);
        --clr-fill-hover: var(--clr-accent);
        --clr-minus: var(--clr-black);
      }

      .check {

        &__goal {
          r: calc(.8*var(--fs-label));
        }

        &__point {
          r: calc(.1*var(--fs-label));
          fill: var(--clr-outline);
        }

        &__main {
          fill: transparent;
          stroke: var(--clr-outline);
          r: calc(.4*var(--fs-label));
          stroke-width: calc(.1*var(--fs-label));
        }
        &__minus {
          stroke: var(--clr-minus);
          stroke-width: calc(.2*var(--fs-label));
        }

      }

      &.active {
        .check {
          &__main {
            fill: var(--clr-fill-selected);
          }

        }
      }

      &.hovered {
        .check {
          &__main {
            fill: var(--clr-fill-hover);
          }
        }
      }


      
  
    }
  }
</style>