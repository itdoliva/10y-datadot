<script>
	import Designs from '$lib/icons/Designs.svelte';
	import Goals from '$lib/icons/Goals.svelte';
	import Industries from '$lib/icons/Industries.svelte';
	import Layouts from '$lib/icons/Layouts.svelte';
	import Period from '$lib/icons/Period.svelte';
	import Products from '$lib/icons/Products.svelte';
	import BlockLayout from '$lib/icons/BlockLayout.svelte';
	import RadialLayout from '$lib/icons/RadialLayout.svelte';
	import Caret from '$lib/icons/Caret.svelte';
	import Play from '$lib/icons/Play.svelte';
	import Pause from '$lib/icons/Pause.svelte';
	import InfoDefault from '$lib/icons/InfoDefault.svelte';
	import InfoActive from '$lib/icons/InfoActive.svelte';
	import InfoHover from '$lib/icons/InfoHover.svelte';
	import Wireless from '$lib/icons/Wireless.svelte';
	import Return from '$lib/icons/Return.svelte';
	import Collapse from '$lib/icons/Collapse.svelte';
	import Logo from '$lib/icons/Logo.svelte';
  import ReturnBackground from '$lib/icons/ReturnBackground.svelte';
  import MousePan from '$lib/icons/MousePan.svelte';
  import Pinch from '$lib/icons/Pinch.svelte';
  import Close from '$lib/icons/Close.svelte';
  import CloseX from '$lib/icons/CloseX.svelte';

  export let icon

  const componentMapper = {
    designs: Designs,
    goals: Goals,
    industries: Industries,
    layouts: Layouts,
    period: Period,
    products: Products,
    block: BlockLayout,
    radial: RadialLayout,
    caret: Caret,
    play: Play,
    pause: Pause,
    wireless: Wireless,
    infoDefault: InfoDefault,
    infoActive: InfoActive,
    infoHover: InfoHover,
    return: Return,
    returnBackground: ReturnBackground,
    collapse: Collapse,
    logo: Logo,
    mousePan: MousePan,
    pinch: Pinch,
    close: Close,
    closeX: CloseX
  }

</script>

<div class="icon-wrapper">
  <svelte:component this={componentMapper[icon]} />
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>