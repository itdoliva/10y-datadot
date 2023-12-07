<script>
  import { getContext } from "svelte";
  import Pokemon from "$lib/components/Pokemon.svelte";

  export let node

  const { getPos } = getContext("layout")

  $: pos = $getPos(node)

</script>

<Pokemon {node} {...pos} />