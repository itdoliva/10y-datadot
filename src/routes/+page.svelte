<script>
  import App from "$lib/App.svelte";
  import "$lib/scss/global.scss";
  import { nodes } from "$lib/store/canvas"

  export let data

  nodes.set(data.nodes)

  console.log($nodes)
</script>

<App />