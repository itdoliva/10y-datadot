<script>
  import Label from "../atoms/Label.svelte";
  export let text
  export let value
  export let group
</script>

<Label {text}>
  <input type="radio" value={value} bind:group={group} />
</Label>