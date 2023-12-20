<script>
  export let title
  export let icon
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
  }

  .header {
    flex-grow: 0;
    flex-shrink: 0;

    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .body {
    flex-grow: 1;
    flex-shrink: 0;
  }

</style>