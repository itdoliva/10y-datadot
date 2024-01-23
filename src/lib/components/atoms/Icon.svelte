<script>
	import Designs from '$lib/icons/Designs.svelte';
	import Goals from '$lib/icons/Goals.svelte';
	import Industries from '$lib/icons/Industries.svelte';
	import Layouts from '$lib/icons/Layouts.svelte';
	import Period from '$lib/icons/Period.svelte';
	import Products from '$lib/icons/Products.svelte';
	import BlockLayout from '$lib/icons/BlockLayout.svelte';
	import RadialLayout from '$lib/icons/RadialLayout.svelte';

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