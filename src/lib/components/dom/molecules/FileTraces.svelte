<script>
  import { selected, dataset } from "$lib/stores/nodes";
  import FileTrace from "$lib/components/webgl/atoms/FileTrace.svelte";

  const node = $dataset.find(d => d.id === $selected.id)

  const traceIds = [
    node.channel,
    ...node.products,
    ...node.designs,
    ...node.goals,
  ]

</script>

<ul class="file-traces" >
  {#each traceIds as traceId}
    <FileTrace id={traceId} />
  {/each}
</ul>

<style lang="scss">
  .file-traces {
    width: 100%;
    height: 100%;
    
    display: grid;
    grid-auto-flow: row;
    grid-auto-rows: min-content;

    gap: 1rem;

    align-content: center;
  }
</style>