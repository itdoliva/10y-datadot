<script>
  import * as PIXI from "pixi.js"

  import castContainer from "$lib/actions/castContainer"
  import { fproducts, categoriesEnriched } from "$lib/stores/nodes";

  import PanelMenu from '$lib/components/organisms/PanelMenu.svelte';
  import PanelItem from "$lib/components/molecules/PanelItem.svelte";
  import InputGroup from "$lib/components/molecules/InputGroup.svelte";

  const pbWrapperContainer = new PIXI.Container()

  let isCollapsed = false

</script>

<ul class="pb-wrapper">

  <li 
    class="pitems-wrapper"
    class:collapsed={isCollapsed}
    use:castContainer={{ container: pbWrapperContainer, hasMask: true }}
  >
    <div>
      <PanelItem icon="products" title="tipos de entrega">
        <InputGroup
          parent={pbWrapperContainer}
          gridlayout="product"
          categories={$categoriesEnriched.products}
          bind:selected={$fproducts}
        />
      </PanelItem>
    </div>
  </li>

  <li class="pmenu-wrapper">
    <PanelMenu />
    <!-- <button on:click={() => isCollapsed = !isCollapsed}>
      HA
    </button> -->
  </li>

</ul>


<style lang="scss">
  .pb-wrapper {
    list-style-type: none;

    .pitems-wrapper {
      padding-left: 1.6rem;
      padding-bottom: .35rem;
      border-bottom: 1px solid black;
    }
  }

</style>