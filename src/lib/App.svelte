<script>
  import { _ } from 'svelte-i18n'

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
  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  import Button from "$lib/components/dom/atoms/Button.svelte";
  import ClearAllFilterButton from "$lib/components/dom/molecules/ClearAllFilterButton.svelte";
	import PlayButton from '$lib/components/dom/molecules/PlayButton.svelte';
  import File from '$lib/components/dom/organisms/File.svelte';
  import ProjectLogo from "$lib/components/dom/organisms/ProjectLogo.svelte";
  import PanelMenu from '$lib/components/dom/organisms/PanelMenu.svelte';
  import InputProduct from "$lib/components/dom/organisms/InputProduct.svelte";
  import InputLayout from "$lib/components/dom/organisms/InputLayout.svelte";
  import InputDesign from "$lib/components/dom/organisms/InputDesign.svelte";
  import InputPeriod from "$lib/components/dom/organisms/InputPeriod.svelte";
  import InputGoal from "$lib/components/dom/organisms/InputGoal.svelte";
  import InputIndustry from "$lib/components/dom/organisms/InputIndustry.svelte";
  import DropdownSortBy from "$lib/components/dom/organisms/DropdownSortBy.svelte";
  import DropdownActivate from "$lib/components/dom/organisms/DropdownActivate.svelte";
  import LanguageChange from "$lib/components/dom/organisms/LanguageChange.svelte";

  // WebGL Components
  import Visualization from '$lib/components/webgl/organisms/Visualization.svelte';


  let layout = 'block'
  let topInputGroupHeight
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


  {#if $width < 768} 

  <header class="mobile-header-container">
    <div class="logo-container">
      <ProjectLogo />
    </div>
    <LanguageChange />
  </header>

  <main 
    class="viz-container"
    class:filter-open={isMobileFilterOpen}
  >
    <Visualization bind:layout />

    <button class="filter-toggle-container" on:click={() => isMobileFilterOpen = true}>
      <p>> {$_("menu.filters")}</p>
    </button>

    <aside class="filter-container"
      use:onClickOutside 
      on:outsideclick={() => isMobileFilterOpen = false}
    >

      <!-- <div class="filter-container__close-btn">
        <button class="clean-btn" on:click={() => isMobileFilterOpen = false}>
          <p>X</p>
        </button>
      </div> -->

      <ul class="filter-container__list">

        <li class="filter-container__list--item input-period">
          <InputPeriod theme="on-dark"/> 
        </li>

        <li class="filter-container__list--item input-design">
          <InputDesign theme="on-dark"/>
        </li>

        <li class="filter-container__list--item input-goal">
          <InputGoal nColumns=2 theme="on-dark"/>
        </li>

        <li class="filter-container__list--item input-product">
          <InputProduct nColumns=2 theme="on-dark"/>
        </li>

        <li class="filter-container__list--item input-industry">
          <InputIndustry theme="on-dark"/>
        </li>

      </ul>

      <div class="filter-container__footer">
        <div class="clear-all-container">
          <ClearAllFilterButton />
        </div>

        <div class="close-btn-container">
          <button class="clean-btn" on:click={() => isMobileFilterOpen = false}>
            <p>X</p>
          </button>
        </div>

      </div>

    </aside>

  </main>

  <section class="layout-container">
    <InputLayout bind:layout={layout} direction="row"/>
  </section>

  <section class="play-container">
    <PlayButton />
  </section>
  

  {:else}

  

  <header 
    class="top-container" 
    class:collapsed={isTopMenuCollapsed}
    style="--input-group-height: {topInputGroupHeight ? `${topInputGroupHeight}px` : "none"};"
  >
    <section class="collapsible" >
      <div class="input-product" 
        use:castContainer={{ context: productContainer, hasMask: true }}
        bind:clientHeight={topInputGroupHeight}
      >
        <InputProduct parent={productContainer} />
      </div>
    </section>

    <ul class="panel-menu">
      <li class="panel-menu__item">
        <DropdownSortBy />
      </li>

      <li class="panel-menu__item">
        <DropdownActivate />
      </li>

      <li class="panel-menu__item clear-all-btn">
        <ClearAllFilterButton />
      </li>

      <li class="panel-menu__item">
        <PlayButton />
      </li>

      <li class="panel-menu__item project-logo no-border">
        <div class="project-logo__wrapper">
          <ProjectLogo />
        </div>
      </li>

      <li class="panel-menu__item collapse-btn no-border">
        <div class="collapse-btn__wrapper">
          <div class="rotate" class:collapsed={isTopMenuCollapsed}>
            <Button 
              onClick={toggleTopMenuCollapse}
              colorDefault="var(--clr-white)"
              colorHover="var(--clr-accent)"
              colorActive="var(--clr-accent-low)"
            >
              <Icon icon="collapse"/>
            </Button>
          </div>
        </div>
      </li>

      <li class="panel-menu__item no-border language-change">
        <div class="language-change-container">
          <LanguageChange />
        </div>
      </li>

    </ul>
  </header>

  <aside class="left-container">
    <ul class="filter-list">
      <li class="filter-list__item input-layout">
        <InputLayout bind:layout={layout} />
      </li>

      <li class="filter-list__item input-period">
        <InputPeriod /> 
      </li>

      <li class="filter-list__item input-design">
        <InputDesign />
      </li>

      <li class="filter-list__item input-goal">
        <InputGoal />
      </li>

      <li class="filter-list__item input-industry">
        <InputIndustry />
      </li>
    </ul>
  </aside>

  <main class="viz-container">
    <Visualization bind:layout />
  </main>


  {/if}
</div>


<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .language-change-container {
    // position: absolute;
    // top: 2rem;
    // right: 2rem;
    z-index: 10;
  }

  .root {
    display: grid;
    height: 100%;

    overflow: hidden;

    grid-template-rows: min-content 1fr min-content calc(4*var(--fs-label));
    grid-template-areas:
      "header"
      "viz"
      "layout"
      "play";

    @include md {
      grid-template-columns: minmax(280px, 1fr) 5fr;
      grid-template-rows: min-content 1fr;
      grid-template-areas:
        "left top"
        "left viz";
    }

    .mobile-header-container { grid-area: header; }
    .viz-container { grid-area: viz; }
    .layout-container { grid-area: layout; }
    .play-container { grid-area: play; }
    .top-container { grid-area: top; }
    .left-container { grid-area: left; }



    .mobile-header-container {
      padding: 
        calc(2.4*var(--fs-label)) 
        calc(2*var(--fs-label))
        calc(1.2*var(--fs-label))
        calc(2*var(--fs-label));
  
      border-bottom: 1px solid var(--clr-black-fade-out);
      z-index: 1;

      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
  
    .layout-container {
      border-top: 1px solid var(--clr-black-fade-out);
  
      padding: 2vw 0 2vw 0;
    }
  
    .play-container {
      border-top: 1px solid var(--clr-black-fade-out);
    }
  
    .viz-container {
      position: relative;
  
      .filter-toggle-container,
      .filter-container {
        position: absolute;
        z-index: 10;
  
        top: 0;
        right: 0;
      }
  
      .filter-toggle-container {
        top: calc(2*var(--fs-label));

        color: var(--clr-white);
        background: var(--clr-black);
  
        border: none;
        border-top-left-radius: var(--fs-label);
        border-bottom-left-radius: var(--fs-label);
  
        padding: var(--fs-label);
  
        // Entrance transition
        transition: transform 750ms ease-in-out 500ms;
      }
  
      .filter-container {
        width: 85vw;
        height: 110%;

        display: grid;
        grid-template-rows: 1fr min-content;

        background: var(--clr-black);
  
        border: 1px solid var(--clr-white);
        border-right: none;
        border-top-left-radius: 3rem;
        border-bottom-left-radius: 3rem;
  
        overflow: hidden;
  
        // Entrance transition
        transition: transform 500ms ease-in-out;
        transform: translate(100%, 0);
  
        // &__close-btn {
        //   position: sticky;
        //   z-index: 3;
  
        //   top: calc(2*var(--fs-label));
        //   left: 100%;
  
        //   padding: .4rem;
  
        //   p {
        //     color: var(--clr-white);
        //     margin: 0 var(--fs-label);
        //     font-size: calc(var(--fs-label)*2);
        //     font-weight: 700;
        //     text-decoration: underline;
  
        //   }
  
        // }

        &__list {
          overflow: auto;
          padding: 4vw 0 4vw 8vw;
  
          &--item {
            border-bottom: 1px solid var(--clr-white-fade-out);
  
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

        &__footer {
          display: grid;
          grid-template-columns: 1fr min-content;
          height: calc(5.4*var(--fs-label));
          border-top: 1px solid var(--clr-white-fade-out);
          
          padding-left: calc(2*var(--fs-label));

          .close-btn-container {
            padding: .4rem;
            border-left: 1px solid var(--clr-white-fade-out);

            display: flex;
            flex-direction: center;
            align-items: center;
  
            p {
              color: var(--clr-white);
              margin: 0 var(--fs-label);
              font-size: calc(var(--fs-label)*2);
              font-weight: 700;

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

    .left-container {
      border-right: 1px solid var(--clr-black);

      overflow-y: auto;

      padding: 
        calc(4*var(--fs-label)) 
        calc(2*var(--fs-label)) 
        calc(2*var(--fs-label)) 
        calc(4*var(--fs-label));

      display: flex;
      flex-direction: column;
      align-items: stretch;

      .filter-list {
        &__item {
          padding: calc(2.4*var(--fs-label)) calc(2*var(--fs-label)) calc(2.4*var(--fs-label)) 0;
          border-bottom: 1px solid var(--clr-black-fade-out);

          &:first-child {
            padding-top: 0;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .top-container {

      .collapsible {
        overflow: hidden;

        max-height: var(--input-group-height);
        transition: all .3s ease-in-out;

        .input-product {
          padding: 
            calc(4*var(--fs-label)) 
            0
            calc(2*var(--fs-label)) 
            calc(4*var(--fs-label));
        } 
      }

      &.collapsed {
        .collapsible {
          transform: translate(0, calc(-1*var(--input-group-height)));
          max-height: 0;
        }
      }


      .panel-menu {
        display: grid;
        grid-template-columns: auto auto auto max-content max-content 1fr min-content;
        grid-template-rows: calc(4*var(--fs-label));
        align-items: stretch;

        border-top: 1px solid var(--clr-black);
        border-bottom: 1px solid var(--clr-black);

        &__item {

          &:not(.no-border) {
            border-right: 1px solid var(--clr-black);
          }

          &.clear-all-btn {
            padding: 0 var(--fs-label);
          }

          &.project-logo {
            padding: 0 calc(2.4*var(--fs-label));
            margin: auto 0;

            .project-logo__wrapper {
              width: calc(14*var(--fs-label));
            }
          }

          &.collapse-btn {
            position: relative;
            z-index: 5;

            .collapse-btn__wrapper {
              position: absolute;
              top: 100%;
              transform: translate(0, -50%);
              
              width: calc(2.6*var(--fs-label));
              
              .rotate {
                transition: transform .15s ease-in-out;
                transform: rotate(0);
                transform-origin: center;

                &.collapsed {
                  transform: rotate(180deg);
                }
              }
            }
          }

          &.language-change {
            align-self: center;
            padding-right: calc(4*var(--fs-label));
          }
        }
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
