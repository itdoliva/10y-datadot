<script>
  import { fly } from "svelte/transition";
  import { selected } from "$lib/stores/nodes";

  import FileTraces from "$lib/components/dom/molecules/FileTraces.svelte";
  import FileDescription from "$lib/components/dom/molecules/FileDescription.svelte";


</script>

<div class="container file">
  {#if $selected.active}
    <div class="file" in:fly={{ y: "1rem" }}>
      <div class="file__traces">
        <FileTraces />
      </div>

      <div class="file__description">
        <FileDescription />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 1;

    display: flex;
    justify-content: center;
    align-items: center;

    pointer-events: none;


    .file {

      pointer-events: all;

      gap: calc(var(--fs-label)*3.6);
  
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      align-items: center;

      &__traces {
        align-self: stretch;
        justify-self: end;
      }
  
      &__description {
        display: grid;
        justify-self: start;
        grid-auto-rows: min-content;
        row-gap: calc(var(--fs-label)*1.2);
      }
  
    }

  }


</style>