<script>
  import App from "$lib/App.svelte";
  import "$lib/scss/global.scss";
  import { dataset } from "$lib/store/nodes"
  import { categories } from "$lib/store/categories"

  export let data

  dataset.set(data.nodes)
  categories.set(data.categories)
</script>

<App />