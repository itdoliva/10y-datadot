<script>
  import Checkbox from "./Checkbox.svelte";
  import Radio from "./Radio.svelte";

  export let multiselect = false
  export let data = []
  export let selected = multiselect ? [] : data[0].value
  export let direction = 'row'
</script>


<div 
  class="inputs"
  style:flex-direction={direction}
>
  {#each data as { text, value }}
    {#if multiselect}
      <Checkbox text={text} value={value} bind:group={selected} />
    {:else}
      <Radio text={text} value={value} bind:group={selected} />
    {/if}
  {/each}
</div>

<style>
  .inputs {
    display: flex;
  }
</style>