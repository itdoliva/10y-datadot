<script>
  // DOM Elements
  import Button from "$lib/components/dom/atoms/Button.svelte"

  export let onClick
  export let disabled
</script>

<Button {onClick} {disabled}
  colorDefault="var(--clr-accent)"
  colorActive="var(--clr-accent)"
  colorHover="var(--clr-accent)"
  colorDisabled="var(--clr-accent-low)"
>
  <p class:disabled={disabled}>selecionar tudo</p>
</Button>

<style lang="scss">
  p {
    text-decoration: underline;

    &:not(.disabled):hover {
      font-weight: 700;
    }
  }
</style>