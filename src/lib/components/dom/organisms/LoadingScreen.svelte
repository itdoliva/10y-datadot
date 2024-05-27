<script>
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import { scale } from 'svelte/transition';

  export let width
  export let height

  $: size =  Math.min(width, height) * ( width < 768 ? 1 : .85 )
</script>

<section 
  class="loading" 
  out:scale={{ start: 2, opacity: 0, delay: 0, duration: 1200 }}
>
  
  <LottiePlayer
    src="./src/lib/loadingLottie.json"
    autoplay={true}
    loop={true}
    controls={false}
    renderer="svg"
    background="transparent"
    width={size}
    height={size}
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
