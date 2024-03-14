<script>
  import Icon
  from "$lib/components/dom/atoms/Icon.svelte";
  export let title
  export let icon = undefined
</script>

<div class="panel-item-wrapper">
  {#if icon}
    <div class="icon">
      <Icon {icon} />
    </div>
  {/if}

  <h6 class="title">{title}</h6>

  <div class="body">
    <slot />
  </div>
</div>

<style lang="scss">
  div.panel-item-wrapper {
    display: grid;
    
    grid-template-columns: 1.2rem 1fr;
    grid-template-rows: max-content min-content;
    grid-template-areas: 
      "icon title"
      "body body";

    gap: .8rem;
  }

  .icon {
    grid-area: icon;
  }

  .title {
    grid-area: title;

    align-self: center;
  
    margin: 0;
    font-size: var(--title-font-size);
    font-weight: 500;
  }

  .body {
    grid-area: body;
  }


</style>