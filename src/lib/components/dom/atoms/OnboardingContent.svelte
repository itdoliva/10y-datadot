<script>
  import { onMount, getContext } from "svelte"
  import tippy from 'tippy.js';

  export let index
  export let nSteps
  export let target
  export let element
  export let active

  const { prevStep, nextStep } = getContext("onboarding")

  let tip = false

  onMount(() => {
    tip = tippy(target, {
      interactive: true,
      trigger: "manual",
      content: element.outerHTML,
      allowHTML: true
    })
  })

  $: if (tip && active) {
    console.log(index, "tip show!", tip)
    tip.show()
  } 
  else if (tip && !active) {
    console.log(index, "tip hide!", tip)
    tip.hide()
  }


</script>

<div bind:this={element} class="onboarding-content" class:active>
  <div class="onboarding-content__body">
    <slot />
  </div>

  <div class="onboarding-content__footer">
    <button on:click={prevStep} disabled={index === 0}>Previous</button>
    <button on:click={nextStep} disabled={index === nSteps - 1}>Next</button>
  </div>
</div>

<style lang="scss">
  .onboarding-content {
    display: none;
  }
</style>