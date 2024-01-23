<script>
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";


  export let x
  export let y
  export let r
  export let pct
  export let label
  export let fill = 'transparent'
  export let active
  export let onClick

  const r_t = tweened(r)

  $: $r_t = r

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<g 
  class="bs-bubble" 
  class:active
  transform="translate({x}, {y})"
  on:click={onClick}
>

  <circle class="outer-circle" r={$r_t} fill={fill} />
  <circle class="inner-circle" r=3 />

  <g class="text-content" font-size="1rem">

    <text 
      class="pct" 
      text-anchor="middle" 
      dominant-baseline="middle"
      dy="-.15em"
    >
      {Math.round(pct*100)}%
    </text> 

    <text 
      class="label" 
      text-anchor="middle" 
      dominant-baseline="middle"
      dy="1.35em"
      filter="url(#text-bg)"
    >
      {label}
    </text>


  </g>

</g>

<style lang="scss">
  .bs-bubble {

    .text-content {
      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */

      pointer-events: none;

      opacity: 0;

      .pct {
        font-weight: 700;
      }

      .label {
        text-transform: lowercase;
        font-size: .6rem;
        font-weight: 500;
      }

      .label-background {
        fill: var(--color-secondary);
      }

    }

    circle.outer-circle {
      stroke: var(--color-accent);
      // fill: transparent;
      stroke-width: 1.5;
    }

    circle.inner-circle {
      fill: var(--color-accent);
    }

  }

  .bs-bubble:hover, .bs-bubble.active {
    circle.outer-circle {
      fill: var(--color-accent);
    }

    .text-content {
      opacity: 1;
    }
  }
</style>