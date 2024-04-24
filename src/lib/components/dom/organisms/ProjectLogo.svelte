<script>
  import { _ } from 'svelte-i18n'

  // DOM Elements
  import Icon from "$lib/components/dom/atoms/Icon.svelte";

</script>

<div class="project-logo">
  <div class="project-logo__icon">
    <Icon icon="logo" />
  </div>
  <p class="project-logo__text">{$_("page.hero")}</p>
</div>

<style lang="scss">
  .project-logo {
    width: 100%;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: baseline;

    gap: .5em;

    &__icon {
      width: min(24rem, 8rem + 5.5vw);
    }

    &__text { 
      text-wrap: nowrap;
      font-size: var(--fs-label);
    }
  }
</style>