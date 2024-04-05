<script>
  // Initialize
  import "./pixi.js"

  // Libraries
  import * as PIXI from "pixi.js"

  // Stores
	import { width, app, hoveredFilter } from '$lib/stores/canvas.js';
	import { selected } from '$lib/stores/nodes';

  // Actions
  import castContainer from "$lib/actions/castContainer"
  import onClickOutside from "$lib/actions/onClickOutside"

  // DOM Components
  import File from '$lib/components/dom/organisms/File.svelte';
  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  import Button from "$lib/components/dom/atoms/Button.svelte";
  import ProjectLogo from "$lib/components/dom/organisms/ProjectLogo.svelte";
  import PanelMenu from '$lib/components/dom/organisms/PanelMenu.svelte';
  import InputProduct from "$lib/components/dom/organisms/InputProduct.svelte";
  import InputLayout from "$lib/components/dom/organisms/InputLayout.svelte";
  import InputDesign from "$lib/components/dom/organisms/InputDesign.svelte";
  import InputPeriod from "$lib/components/dom/organisms/InputPeriod.svelte";
  import InputGoal from "$lib/components/dom/organisms/InputGoal.svelte";
  import InputIndustry from "$lib/components/dom/organisms/InputIndustry.svelte";
  import ClearAllFilterButton from "$lib/components/dom/molecules/ClearAllFilterButton.svelte";
	import PlayButton from '$lib/components/dom/molecules/PlayButton.svelte';

  // WebGL Components
  import Visualization from '$lib/components/webgl/organisms/Visualization.svelte';

  let layout = 'block'
  let isTopMenuCollapsed = false
  let isMobileFilterOpen = false

  const productContainer = new PIXI.Container()
  productContainer.name = "top-panel"


  function toggleTopMenuCollapse() {
    isTopMenuCollapsed = !isTopMenuCollapsed
    return 
  }


</script>

<div class="root">


  {#if $width <= 768} 

  <header class="logo-container">
    <ProjectLogo />
  </header>

  <main 
    class="viz-container"
    class:filter-open={isMobileFilterOpen}
  >
    <!-- <Visualization bind:layout /> -->

    <button class="filter-toggle-container" 
      on:click={() => isMobileFilterOpen = true}
    >
      <p>filtros <span class="plus">+</span></p>
    </button>

    <aside 
      class="filter-container"
      use:onClickOutside 
      on:outsideclick={() => isMobileFilterOpen = false}
    >

      <button class="filter-container__close-btn clean-btn"
        on:click={() => isMobileFilterOpen = false}
      >
        <p>X</p>
      </button>

      <ul class="filter-list">

        <li class="filter-list__item input-period">
          <InputPeriod /> 
        </li>

        <li class="filter-list__item input-design">
          <InputDesign />
        </li>

        <li class="filter-list__item input-goal">
          <InputGoal nColumns=2 />
        </li>

        <li class="filter-list__item input-product">
          <InputProduct nColumns=2 />
        </li>

        <li class="filter-list__item input-industry">
          <InputIndustry />
        </li>

      </ul>

    </aside>

  </main>

  <section class="layout-container">
    <InputLayout bind:layout={layout} direction="row"/>
  </section>

  <section class="play-container">
    <PlayButton />
    <ClearAllFilterButton />
  </section>
  

  {:else}

  <InputPeriod /> 

  {/if}
    <!-- <div class="pa-container">

      <ul class="pitems-wrapper pa-wrapper">
        <li>
          <InputLayout bind:layout />
        </li>
      
        <li>
          <InputPeriod /> 
        </li>
      
        <li>
          <InputDesign />
        </li>
      
        <li>
          <InputGoal />
        </li>
      
        <li>
          <InputIndustry />
        </li>
      </ul>

    </div> -->
    <!-- <div class="pb-container">
      
      <div class="pb-wrapper">

        <ul>
          <li class="pitems-wrapper" class:collapsed={isTopMenuCollapsed} use:castContainer={{ context: productContainer, hasMask: true }} >
            <InputProduct parent={productContainer} />
          </li>

          <li class="pmenu-wrapper">
            <PanelMenu />
          </li>

        </ul>

        <div 
          class="button-wrapper"
        >
          <button class:collapsed={isTopMenuCollapsed} on:click={toggleTopMenuCollapse}>
            <Icon icon="collapse"/>
          </button>
        </div>
      </div>
    </div> -->
    <!-- <div class="viz-container">
      <Visualization bind:layout />
      <File />
    </div> -->
</div>


<style lang="scss">
  .root {
    display: grid;
    height: 100%;

    overflow: hidden;

    grid-template-rows: min-content 1fr min-content min-content;
    grid-template-areas:
      "logo"
      "viz"
      "layout"
      "play";
  }

  .logo-container { grid-area: logo; }
  .viz-container { grid-area: viz; }
  .layout-container { grid-area: layout; }
  .play-container { grid-area: play; }

  .logo-container {
    padding-block: 1rem;

    border-bottom: 1px solid var(--clr-black-fade-out);
    z-index: 1;
  }

  .layout-container {
    border-top: 1px solid var(--clr-black-fade-out);

    padding: 2vw 0 2vw 0;
  }

  .play-container {
    border-top: 1px solid var(--clr-black-fade-out);
    
    padding: 2vw 0 2vw 0;

    display: grid;
    grid-template-columns: repeat(2, min-content);
    justify-content: center;

    gap: var(--fs-label);
  }

  .viz-container {
    position: relative;

    .filter-toggle-container,
    .filter-container {
      position: absolute;

      top: calc(2*var(--fs-label));
      right: 0;
    }

    .filter-toggle-container {
      color: white;
      background: var(--clr-black);

      border: none;
      border-top-left-radius: 3rem;
      border-bottom-left-radius: 3rem;

      padding: 2rem 1rem 2rem 1rem;

      // Entrance transition
      transition: transform 750ms ease-in-out 500ms;
      
      p {
        writing-mode: vertical-lr;
        transform: rotate(-180deg);

        .plus {
          font-size: 1.1em;
          font-weight: 700;
          text-decoration: underline;
        }
      }

    }

    .filter-container {
      width: 85vw;
      height: calc(100% - 4*var(--fs-label));

      border: 1px solid var(--clr-black);
      border-right: none;
      border-top-left-radius: 3rem;
      border-bottom-left-radius: 3rem;

      overflow: auto;

      // Entrance transition
      transition: transform 500ms ease-in-out;
      transform: translate(100%, 0);

      &__close-btn {
        position: sticky;
        z-index: 3;

        top: calc(2*var(--fs-label));
        left: 100%;

        padding: .4rem;

        p {
          margin: 0 var(--fs-label);
          font-size: calc(var(--fs-label)*2);
          font-weight: 700;
          text-decoration: underline;

        }

      }

      .filter-list {
        position: absolute;
        top: 0;
        width: 100%;
        overflow: hidden;
        padding: 4vw 0 4vw 8vw;

        &__item {
          border-bottom: 1px solid var(--clr-black-fade-out);

          padding: 2rem 4vw 2rem 0;

          &:last-child {
            border-bottom: none;
          }

          &.input-period,
          &.input-design {
            padding-right: min(16vw, 4rem);
          }
        }

      }
    }

    &.filter-open {
      .filter-toggle-container {
        transform: translate(100%, 0);

        // Exit Transition
        transition: transform 200ms ease-in-out;
        pointer-events: none;
      }

      .filter-container {
        transform: translate(0, 0);
      }
    }

  }




  // .root {
  //   position: relative;
  //   overflow: hidden;

  //   width: 100%;
  //   height: 100%;
    
  //   display: grid;
  //   grid-template-rows: min-content repeat(4, 1fr);
  //   grid-template-columns: minmax(240px, 1fr) repeat(4, 1fr);
  //   grid-template-areas: 
  //     "pa pb pb pb pb"
  //     "pa vi vi vi vi"
  //     "pa vi vi vi vi"
  //     "pa vi vi vi vi"
  //     "pa vi vi vi vi";
  // }


  // .pa-container {
  //   grid-area: pa;

  //   border-right: 1px solid black;

  //   overflow-y: auto;
  //   overflow-x: visible;

  //   z-index: 1;
  // }

  // .pa-wrapper  {
  //   list-style-type: none;

  //   display: flex;
  //   flex-direction: column;
  //   justify-content: flex-start;
  //   align-items: stretch;

  //   li {
  //     padding-bottom: .8rem;
  //     margin-bottom: .8rem;

  //     &:not(:last-child) {
  //       border-bottom: .5px solid black;
  //     }
  //   }
  // }

  // .pb-container {
  //   grid-area: pb;
  //   border-bottom: 1px solid black;

  //   z-index: 1;
  // }

  // .pb-wrapper {
  //   position: relative;

  //   ul {
  //     list-style-type: none;

  //     .pitems-wrapper {
  //       padding-left: 1.6rem;
  //       padding-bottom: .35rem;
  //       border-bottom: 1px solid black;

  //       transition: height .15s ease-in-out, padding .15s ease-in-out;

  //       &.collapsed {
  //         height: 0;
  //         padding: 0;
  //         display: none;
  //       }
  //     }

  //   }

  //   .button-wrapper {
  //     position: absolute;
  //     bottom: 0;
  //     right: 4rem;
  //     transform: translate(-50%, 50%);

  //     width: 3rem;
  //     height: 3rem;


  //     button {
  //       width: 100%;
  //       height: 100%;

  //       border: none;
  //       background: none;
  //       outline: none;

  //       transform: rotate(0);
  //       transition: transform .15s ease-in-out;
        
  //       &.collapsed {
  //         transform: rotate(180deg);
  //       }
  //     }

  //   }
  // }

  // .viz-container {
  //   position: relative;

  //   grid-area: vi;
  //   pointer-events: none;
  // }

  // :global(.pitems-wrapper) {
  //   padding: 3.2rem 1.4rem 1.4rem 3.2rem;
  // }


</style>
