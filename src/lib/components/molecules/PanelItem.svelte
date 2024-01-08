<script>
  export let title
  export let icon = undefined
</script>

<li class="panel-item-wrapper">
  <div class="header">
    <h6>{title}</h6>
  </div>

  <div class="body">
    <slot />
  </div>
</li>

<style lang="scss">
  li.panel-item-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    gap: .4em;
  }

  .header {
    flex-grow: 0;
    flex-shrink: 0;

    display: flex;
    flex-direction: row;
    align-items: center;

    h6 {
      margin: 0;
      font-size: var(--title-font-size);
    }
  }

  .body {
    flex-grow: 1;
    flex-shrink: 0;
  }

</style>