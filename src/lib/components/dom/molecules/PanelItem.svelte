<script>
  import { getContext } from "svelte";

  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  
  export let title
  export let icon = undefined
  export let direction = "column"

  const { theme } = getContext("item-theme")


</script>

<div 
  class="panel-item-container w-full flex container {direction} {theme}">
  <div class="panel-item">

    {#if icon}
      <div class="panel-item__icon">
        <Icon {icon} />
      </div>
    {/if}

    <h3 class="panel-item__title text-xs">
      {title}
    </h3>

    <div class="panel-item__body">
      <slot />
    </div>

  </div>
</div>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

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
        color: var(--clr-main);
        align-self: center;
  
        margin: 0;
        font-weight: 500;
      }

      &__icon {
        display: none;
        color: var(--clr-main);
        fill: var(--clr-main);

        @include md {
          display: block;
        }
      }


    }

    &.on-light {
      --clr-main: var(--clr-black);
    }

    &.on-dark {
      --clr-main: var(--clr-white);
    }

    &.column {
      align-items: stretch;

      .panel-item {
        width: 100%;
        
        grid-template-columns: 1.375rem minmax(0,1fr);
        grid-template-rows: max-content min-content;
        grid-template-areas: 
          "title title"
          "body body";

        @include md {
          grid-template-areas: 
            "icon title"
            "body body";
          }
      }
    }

    &.row {
      justify-content: center;
      
      .panel-item {
        grid-template-columns: 1.375rem max-content max-content;
        grid-template-areas:
          "title title body";

        @include md {
          grid-template-areas:
            "icon title body";
        }
      }
    }
  }


</style>