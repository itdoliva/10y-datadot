<script>
  import { getContext } from "svelte";
  import { _ } from 'svelte-i18n'

  // Libraries
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import * as d3 from "d3"

  // Stores
	import { lineWidth } from '$lib/stores/nodes.js';

  export let x
  export let y
  export let r
  export let tweenDelay
  export let percentage
  export let alias
  export let fill = 'transparent'
  export let active

  const { theme } = getContext("item-theme")

  const r_t = tweened(r, { duration: 300, delay: tweenDelay, ease: d3.easeQuadInOut })

  $: $r_t = r

</script>

<g class="bs-bubble {theme}" class:active transform="translate({x}, {y})">

  <circle class="circle outer" r={$r_t} {fill} stroke-width={$lineWidth} />
  <circle class="circle inner" r={2.4*$lineWidth} />

  <g class="text" font-size="1rem">

    {#if percentage > 0}
      <text class="text__percentage" text-anchor="middle" dominant-baseline="middle" dy="-.15em">
        {Math.round(percentage*100)}%
      </text> 
    {/if}

    <text class="text__alias" text-anchor="middle" dominant-baseline="middle" dy="1.35em" filter="url(#text-bg)">
      {$_(alias)}
    </text>


  </g>

</g>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .bs-bubble {

    .circle {
      z-index: 0;

      &.outer {
        stroke: var(--clr-accent);
      }

      &.inner {
        fill: var(--clr-accent);
      }
    }

    .text {
      z-index: 1;
      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */

      pointer-events: none;


      &__percentage {
        font-weight: 700;
        font-size: calc(2*var(--fs-label));
        fill: var(--clr-white);

        opacity: 0;

        @include md {
          fill: var(--clr-black);
        }
      }

      &__alias {
        text-transform: lowercase;
        font-size: var(--fs-label);
        font-weight: 500;

        @include md {
          opacity: 0;
        }
      }

    }

    &.active {
      .circle {
        &.outer {
          fill: var(--clr-accent);
        }
      }

      .text {
        &__percentage {
          opacity: 1;
        }
      }
    }

    @include md {
      &:hover, &.active {
        .circle {
          &.outer {
            fill: var(--clr-accent);
          }
        }

        .text {
          &__percentage {
            opacity: 1;
          }

          &__alias {
            opacity: 1;
          }
        }
      }
    }


    // &.active {
    //   .text {
    //     &__percentage {
    //       opacity: 1
    //     }

    //     &__label {
    //       @include md {
    //         opacity: 1;
    //       }
    //     }
    //   }

    // }




  }

</style>