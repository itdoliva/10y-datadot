<script>
  import { setContext } from 'svelte';
	import Icon from '$lib/components/dom/atoms/Icon.svelte';
  
  export let title

  let active = false

  function handlePointerEnter(e) {
    active = true
    e.preventDefault()
    e.stopPropagation()
  }
  
  function handlePointerLeave(e) {
    active = false
    e.preventDefault()
    e.stopPropagation()
  }

  function handlePointerUp(e) {
    active = !active
    e.preventDefault()
    e.stopPropagation()
  }

  setContext("item-theme", { theme: "on-dark" })

</script>

<div class="dropdown" class:active
  on:pointerenter={handlePointerEnter}
  on:pointerleave={handlePointerLeave}
>
  <button class="button" on:pointerup={handlePointerUp}>

    {#if title}
      <div class="button__icon">
        <Icon icon='caret' />
      </div>

      <span class="button__label text-xxs">{title}</span>
    {:else}
      <span class="button__label text-xxs">...</span>
    {/if}
  </button>

  <div class="content">
    <slot />
  </div>

</div>

<style lang="scss">
  .dropdown {
    position: relative;
    width: 100%;
    height: 100%;


    .button {
      padding: 0 1rem;

      display: grid;
      grid-template-columns: max-content max-content;
      align-items: center;

      width: 100%;
      height: 100%;
      border: none;
      background: none;

      font-family: inherit;
      cursor: pointer;
      
      text-align: left;

      &__icon {
        align-self: center;
        width: 1rem;
        transform: translateY(-.085rem) rotate(-90deg);
        transition: transform 150ms ease-in-out;
      }

      &__label {
      }
    }

    .content {
      position: absolute;

      padding: 1rem;

      min-width: calc(100% + 2px);
      left: -1px;
      top: 100%;
      background-color: hsla(0, 0%, 100%, .9);
      border: 1px solid var(--clr-black);

      background: var(--clr-black);
      
      pointer-events: none;
      opacity: 0;
      transform: translateY(-.15rem);
      transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;
      z-index: 10;

      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: calc(2*var(--fs-label));
    }

    &:global(.active) {
      .content {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto !important;
      }

      .button {
        &__icon {
          transform: rotate(0);
        }
      }
    }

  }


</style>