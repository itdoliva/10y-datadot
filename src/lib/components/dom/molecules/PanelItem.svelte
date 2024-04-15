<script>
  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  
  export let title
  export let icon = undefined
  export let direction = "column"

</script>

<div class="panel-item-container container {direction}">
  <div class="panel-item">

    {#if icon}
      <div class="panel-item__icon">
        <Icon {icon} />
      </div>
    {/if}

    <h6 class="panel-item__title">{title}</h6>

    <div class="panel-item__body">
      <slot />

    </div>
  </div>
</div>

<style lang="scss">
  div.container {
    width: 100%;

    display: flex;
    
    .panel-item {
      display: grid;
      gap: .8rem;

      &__icon { grid-area: icon; }
      &__title { grid-area: title; }
      &__body { grid-area: body; }

      &__title {
        align-self: center;
  
        margin: 0;
        font-size: var(--fs-title);
        font-weight: 500;
      }
    }

    &.column {
      align-items: stretch;

      .panel-item {
        width: 100%;
        
        grid-template-columns: 1.2rem 1fr;
        grid-template-rows: max-content min-content;
        grid-template-areas: 
          "icon title"
          "body body";
      }
    }

    &.row {
      justify-content: center;
      
      .panel-item {
        grid-template-columns: 1.2rem max-content max-content;
        grid-template-areas:
          "icon title body";
      }
    }
  }


</style>