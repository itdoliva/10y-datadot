<script>
  import { _ } from 'svelte-i18n'

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
  <p class:disabled={disabled}>{$_("input.unselect")}</p>
</Button>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  p {
    text-decoration: underline;

    &:not(.disabled) {
      &:hover {
        font-weight: 700;
      }
    }

    &.disabled {
      opacity: .4;

      @include md {
        opacity: 1;
      }
    }
  }
</style>