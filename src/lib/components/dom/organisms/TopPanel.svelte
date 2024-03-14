<script>
  import * as PIXI from "pixi.js"
  
  import castContainer from "$lib/actions/castContainer"
  
  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  import PanelMenu from '$lib/components/dom/organisms/PanelMenu.svelte';
  import InputProduct from "$lib/components/dom/organisms/InputProduct.svelte";

  const productContainer = new PIXI.Container()
  productContainer.name = "top-panel"

  let isCollapsed = false

</script>

<div class="pb-wrapper">

  <ul>
    <li 
      class="pitems-wrapper"
      class:collapsed={isCollapsed}
      use:castContainer={{ context: productContainer, hasMask: true }}
    >
      <InputProduct parent={productContainer} />
    </li>

    <li class="pmenu-wrapper">
      <PanelMenu />
    </li>

  </ul>

  <div 
    class="button-wrapper"
  >
    <button 
      on:click={() => isCollapsed = !isCollapsed}
      class:collapsed={isCollapsed}
    >
      <Icon icon="collapse"/>
    </button>
  </div>
</div>


<style lang="scss">
  .pb-wrapper {
    position: relative;

    ul {
      list-style-type: none;

      .pitems-wrapper {
        padding-left: 1.6rem;
        padding-bottom: .35rem;
        border-bottom: 1px solid black;

        transition: height .15s ease-in-out, padding .15s ease-in-out;

        &.collapsed {
          height: 0;
          padding: 0;
          display: none;
        }
      }

    }

    .button-wrapper {
      position: absolute;
      bottom: 0;
      right: 4rem;
      transform: translate(-50%, 50%);

      width: 3rem;
      height: 3rem;


      button {
        width: 100%;
        height: 100%;

        border: none;
        background: none;
        outline: none;

        transform: rotate(0);
        transition: transform .15s ease-in-out;
        
        &.collapsed {
          transform: rotate(180deg);
        }
      }

    }
  }



</style>