<script>
  import { fly } from "svelte/transition";
  import { selected } from "$lib/stores/nodes";
  import FileTraces from "$lib/components/molecules/FileTraces.svelte";
  import FileDescription from "$lib/components/molecules/FileDescription.svelte";


</script>

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

<style lang="scss">
  .file {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    z-index: 1;

    gap: 2rem;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    
    padding: 0 20%;

    &__traces {
      align-self: stretch;

    }

    &__description {
      display: grid;
      grid-auto-rows: min-content;
      row-gap: 1.25rem;
    }

  }


</style>