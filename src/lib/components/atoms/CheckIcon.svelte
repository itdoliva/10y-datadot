<script>
  export let active = false
  export let size = 10
  export let strokewidth = 1

  const lineprop = .275
</script>

<svg 
  style:--size={size + "px"}
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
>
  <g transform="translate({size/2}, {size/2})">
    <circle
      style:--fill={active ? "black" : "transparent"}
      stroke="black"
      stroke-width={strokewidth}
      r={(size-2*strokewidth)/2}
    />

    <g 
      class="lines" 
      style:--stroke={active ? "white" : "black"}
    >
      <line x1={-size*lineprop} x2={size*lineprop} y1=0 y2=0/>

      {#if !active}
        <line y1={-size*lineprop} y2={size*lineprop} x1=0 x2=0/>
      {/if}
    </g>
  </g>
</svg>

<style lang="scss">
  svg {
    width: var(--size);
    height: var(--size);

    margin: 0;
    padding: 0;

    circle {
      fill: var(--fill);
    }

    .lines {
      stroke: var(--stroke);
    }

  }
</style>