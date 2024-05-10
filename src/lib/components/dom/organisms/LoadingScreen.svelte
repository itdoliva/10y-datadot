<script>
  import { Circle2 } from 'svelte-loading-spinners';
  import { fade } from 'svelte/transition';
</script>

<section 
  class="loading" 
  transition:fade={{ delay: 0, duration: 1200 }}
>
  <Circle2
    colorOuter="#0D0D0D"
    colorCenter="#7781FA"
    colorInner="#CFFF6C"
    size=120
  />
</section>

<style lang="scss">
  .loading {
    position: absolute;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
