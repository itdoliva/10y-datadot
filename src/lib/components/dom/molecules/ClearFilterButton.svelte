<script>
  // DOM Elements
  import Button from "$lib/components/dom/atoms/Button.svelte"

  export let onClick
  export let disabled
</script>

<Button {onClick} {disabled}>
  <span>selecionar tudo</span>
</Button>

<style lang="scss">
  span {
    text-decoration: underline;
  }
</style>