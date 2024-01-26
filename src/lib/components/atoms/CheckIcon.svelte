<script>
  export let size = 10
  export let strokewidth = 1
  export let active = false
  export let hovered = false

  const lineprop = .35
</script>

<svg 
  style:--size={size + "px"}
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
>
  <g transform="translate({size/2}, {size/2})">

    <circle
      class="main"
      fill={active ? "black" : hovered ? "#8D95FB" : "transparent"}
      stroke="black"
      stroke-width={strokewidth}
      r={(size-2*strokewidth)/2}
    />

    {#if active}
      <line x1={-size*lineprop} x2={size*lineprop} y1=0 y2=0 stroke="#8D95FB" stroke-width=1.5/>
    {:else if !hovered}
      <circle r=1 />
    {/if}

  </g>
</svg>

<style lang="scss">
  svg {
    width: var(--size);
    height: var(--size);

    margin: 0;
    padding: 0;
  }
</style>