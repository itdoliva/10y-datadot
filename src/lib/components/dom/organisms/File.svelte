<script>
  import { fly } from "svelte/transition";
  import { selected } from "$lib/stores/nodes";
  
	import Icon from '$lib/components/dom/atoms/Icon.svelte';
  import FileTraces from "$lib/components/dom/molecules/FileTraces.svelte";
  import FileDescription from "$lib/components/dom/molecules/FileDescription.svelte";

  export let nColumns = 1
  export let outerClose = false

  function onClick() {
    selected.set({ active: false })
  }


</script>

<div class="container file">
  {#if $selected.active}
    <div class="file" in:fly={{ y: 20 }}>
      <div class="file__traces">
        <FileTraces {nColumns} />
      </div>

      <div class="file__description">
        <FileDescription {onClick} {outerClose} />
      </div>

      {#if outerClose}
        <button class="file__close" on:click={onClick} in:fly={{ y: 80, duration: 2000, delay: 1000 }}>
          <Icon icon="return"/>
        </button>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .container {
    overflow: hidden;

    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 1;

    pointer-events: none;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 0 calc(3.2*var(--fs-label));
    padding-top: calc(4.2*var(--fs-label));

    @include md {
      padding: 0;
    }

    .file {
      position: relative;

      width: 100%;
      height: 100%;
      
      display: grid;
      grid-template-rows: max-content 1fr;
      grid-template-areas: 
        "description"
        "traces";
      align-content: center;
      row-gap: calc(var(--fs-label)*3.6);
      
      pointer-events: all;

      @include md {
        grid-template-rows: none;
        grid-template-columns: repeat(2, 1fr);
        grid-template-areas: "traces description";
        column-gap: calc(var(--fs-label)*3.6);
        row-gap: 0;
      }

      &__traces { grid-area: traces; }
      &__description { grid-area: description; }

      &__traces {
        align-self: stretch;
        
        @include md {
          justify-self: end;
        }
      }
  
      &__description {
        display: grid;
        justify-self: start;
        grid-auto-rows: min-content;
        row-gap: calc(var(--fs-label)*1.2);
      }

      &__close {
        position: absolute;
        bottom: var(--fs-label);
        right: 0;

        pointer-events: all;
        background: none;
        border: none;
        outline: none;
        width: calc(var(--fs-label)*4.8);
        height: calc(var(--fs-label)*4.8);

        stroke: var(--clr-black);
        stroke-width: clump(1.15px, calc(var(--fs-label)/12), 4px);

        &:hover {
          stroke: var(--clr-accent);
        }
      }
    }

  }


</style>