<script>
  import { fly } from "svelte/transition"
  import { selected } from "$lib/stores/nodes"
</script>

{#if $selected.active}
  <div class="file" transition:fly={{ y: "1rem" }}>

    <div class="primitives-container">

    </div>

    <div class="text-container">

      <div class="header">
        <h3>IJEN</h3>
        <h4>Baboom Filmes</h4>
      </div>

      <ul class="categories">
        <li>Comunicação;</li>
        <li>Agência publicidade;</li>
      </ul>

      <p class="description">
        Infográficos animados para auxiliar na narrativa do documentário.
      </p>
      
      <div class="footer">
        <p class="date">01/2014</p>
        <button on:click={() => selected.set({ active: false })}>
          Back
        </button>
      </div>

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

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    
    padding: 0 10%;

    .text-container {
      display: grid;
      grid-auto-rows: min-content;
      row-gap: 1rem;
    }


    h3 {
      font-weight: 700;
    }

    ul {
      li {
        display: inline;
      }
    }


    button {
      pointer-events: all;
    }
  }


</style>