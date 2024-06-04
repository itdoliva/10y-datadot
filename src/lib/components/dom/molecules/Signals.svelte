<script>
  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  
	import { selected } from '$lib/stores/nodes';

</script>

<div class="signals" class:fade={!!$selected}>

  <div id="pinch-signal" class="signal signals__pinch">
    <Icon icon="pinch" />
  </div>

  <div id="pan-signal" class="signal signals__pan">
    <Icon icon="mousePan" />
  </div>

</div>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .signals {
    position: absolute;
    bottom: calc(1.6*var(--fs-label));
    right: calc(1.6*var(--fs-label));


    opacity: 1;
    transition: opacity .5s ease-in-out;

    display: flex;
    flex-direction: column;
    gap: var(--fs-label);

    &.fade {
      opacity: 0;
    }

    @include md {
      bottom: 5%;
      right: 50%;
      transform: translate(-50%, 0);
    }

    .signal {
      width: calc(3.6*var(--fs-label));
      display: none;

      -webkit-animation: ping 1s ease-in-out infinite both;
      animation: ping 1s ease-in-out infinite both;
    }

  }
</style>