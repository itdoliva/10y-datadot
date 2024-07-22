<script>
  import { _, locale } from 'svelte-i18n'
  import { onMount } from 'svelte';

  import simulation from "$lib/simulation"
  import { mobileSteps, desktopSteps, mobileEls, desktopEls } from '$lib/onboarding';

  // Initialize
  import "./pixi.js"
  
  // Libraries
  import * as PIXI from "pixi.js"

  // Stores
	import { width, figureWidth, complexityOn, linkClientOn, linkProjectOn, hovered } from '$lib/stores/canvas.js';
  import { selected, sortBy, fyears, fdesigns, fgoals, findustries, fproducts } from '$lib/stores/nodes.js';
  import { cameraOffsetY } from '$lib/stores/zoom.js';
  import { nodesLoaded } from '$lib/stores/loading.js';
  import { isOpen } from '$lib/stores/techsheet.js';

  // Actions
  import castContainer from "$lib/actions/castContainer"
  import onClickOutside from "$lib/actions/onClickOutside"

  // DOM Components
  import Icon from "$lib/components/dom/atoms/Icon.svelte";
  import Button from "$lib/components/dom/atoms/Button.svelte";
  import ClearAllFilterButton from "$lib/components/dom/molecules/ClearAllFilterButton.svelte";
	import PlayButton from '$lib/components/dom/molecules/PlayButton.svelte';
  import ProjectLogo from "$lib/components/dom/organisms/ProjectLogo.svelte";
  import InputProduct from "$lib/components/dom/organisms/InputProduct.svelte";
  import InputLayout from "$lib/components/dom/organisms/InputLayout.svelte";
  import InputDesign from "$lib/components/dom/organisms/InputDesign.svelte";
  import InputPeriod from "$lib/components/dom/organisms/InputPeriod.svelte";
  import InputGoal from "$lib/components/dom/organisms/InputGoal.svelte";
  import InputIndustry from "$lib/components/dom/organisms/InputIndustry.svelte";
  import DropdownSortBy from "$lib/components/dom/organisms/DropdownSortBy.svelte";
  import DropdownActivate from "$lib/components/dom/organisms/DropdownActivate.svelte";
  import LanguageChange from "$lib/components/dom/organisms/LanguageChange.svelte";
  import File from "$lib/components/dom/organisms/File.svelte";
  import TechSheet from '$lib/components/dom/molecules/TechSheet.svelte';

  // WebGL Components
  import Visualization from '$lib/components/webgl/organisms/Visualization.svelte';
  import Signals from './components/dom/molecules/Signals.svelte';
  import Onboarding from './components/dom/organisms/Onboarding.svelte';

  const productContainer = new PIXI.Container()
  productContainer.name = "top-panel"

  let layout = 'block'
  let topInputGroupHeight
  let isTopMenuCollapsed = false
  let isMobileFilterOpen = false

  let mobileVizContainer
  let mobileFilterContainer

  $: positionMobileFilter(mobileVizContainer)

  $: simulation.setLayout(layout)
  $: simulation.filter($fyears, $findustries, $fdesigns, $fgoals, $fproducts)
  $: simulation.sort($sortBy)

  $: simulation.handleWindowResize($width)
  $: simulation.handleFigureResize($figureWidth)
  $: simulation.handleSelected($selected)
  $: simulation.handleHovered($hovered)
  $: simulation.handleComplexity($complexityOn)
  $: simulation.handleLinks("clients", $linkClientOn)
  $: simulation.handleLinks("projects", $linkProjectOn)
  $: simulation.handleLanguageChange($locale)

  function toggleTopMenuCollapse() {
    isTopMenuCollapsed = !isTopMenuCollapsed
    return 
  }

  function positionMobileFilter(mobileVizContainer) {
    if (!mobileVizContainer) {
      return
    }

    const bbox = mobileVizContainer.getBoundingClientRect()

    mobileFilterContainer.top = 0
    // mobileFilterContainer.style.top = bbox.y + "px"
    mobileFilterContainer.style.width = bbox.width + "px"
    mobileFilterContainer.style.height = (bbox.height*1.1) + "px"
  }


</script>

<div class="root">
  {#if $nodesLoaded}
    {#if $width < 768} 

      <header class="mobile-header-container">
        <div class="logo-container">
          <ProjectLogo />
        </div>

        <div class="options-wrapper">

          <div class="techsheet-wrapper">
            <Button onClick={() => isOpen.set(true)}>
              <Icon icon="infoDefault" />
            </Button>
          </div>

          <LanguageChange />
        </div>

      </header>

      <main class="viz-container" bind:this={mobileVizContainer} on:resize={positionMobileFilter}>
        <Signals />
        <Visualization />
        <File nColumns=2 outerClose={true} />
      </main>

      <div class="filter-container" class:filter-open={isMobileFilterOpen} bind:this={mobileFilterContainer}>

        <button class="filter-toggle" on:click={() => isMobileFilterOpen = true}>
          <p>> {$_("menu.filters")}</p>
        </button>

        <aside class="filter-panel" use:onClickOutside on:outsideclick={() => isMobileFilterOpen = false}>

          <ul class="filter-panel__list">

            <li class="filter-panel__list--item input-period">
              <InputPeriod theme="on-dark"/> 
            </li>

            <li class="filter-panel__list--item input-design">
              <InputDesign theme="on-dark"/>
            </li>

            <li class="filter-panel__list--item input-goal">
              <InputGoal nColumns=2 theme="on-dark"/>
            </li>

            <li class="filter-panel__list--item input-product">
              <InputProduct nColumns=2 theme="on-dark"/>
            </li>

            <li class="filter-panel__list--item input-industry">
              <InputIndustry theme="on-dark"/>
            </li>

          </ul>

          <div class="filter-panel__footer">

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

      </div>

      <section class="layout-container">
        <InputLayout bind:layout direction="row"/>
      </section>

      <section class="play-container">
        <PlayButton />
      </section>
    
    {:else}

      <header class="top-container" 
        class:collapsed={isTopMenuCollapsed}
        style="--input-group-height: {topInputGroupHeight ? `${topInputGroupHeight}px` : "none"};"
      >
        <section class="collapsible" >
          <div class="input-product" 
            use:castContainer={{ context: productContainer, hasMask: true, propagateOpacity: ".collapsible" }}
            bind:clientHeight={topInputGroupHeight}
          >
            <InputProduct parent={productContainer} />
          </div>

          <div class="techsheet-wrapper">
            <Button onClick={() => isOpen.set(true)}>
              <Icon icon="infoDefault" />
            </Button>
          </div>
        </section>

        <ul class="panel-menu">
          <li class="panel-menu__item dropdown-sortby">
            <DropdownSortBy />
          </li>

          <li class="panel-menu__item dropdown-activate">
            <DropdownActivate />
          </li>

          <li class="panel-menu__item clear-all-btn">
            <ClearAllFilterButton />
          </li>

          <li class="panel-menu__item play-btn">
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
        <Signals />
        <Visualization />
        <File />
      </main>

    {/if}
  {/if}

  <Onboarding 
    steps={$width < 768 ? mobileSteps : desktopSteps}
    el={$width < 768 ? mobileEls : desktopEls}
  />

  <TechSheet />

</div>


<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .language-change-container {
    z-index: 10;
  }

  .root {
    position: relative;

    width: 100%;
    height: 100%;
    overflow: hidden;

    display: grid;

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
    .filter-container { grid-area: viz; }
    .layout-container { grid-area: layout; }
    .play-container { grid-area: play; }
    .top-container { grid-area: top; }
    .left-container { grid-area: left; }



    .mobile-header-container {
      z-index: 1;

      padding: 
        calc(2.4*var(--fs-label)) 
        calc(2*var(--fs-label))
        calc(1.2*var(--fs-label))
        calc(2*var(--fs-label));
  
      border-bottom: 1px solid var(--clr-black-fade-out);

      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .options-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        align-items: flex-end;

        .techsheet-wrapper {
          width: calc(2*var(--fs-label));
          height: calc(2*var(--fs-label));
        }
      }
    }
  
    .layout-container {
      z-index: 1;
      border-top: 1px solid var(--clr-black-fade-out);
  
      padding: 2vw 0 2vw 0;
    }
  
    .play-container {
      z-index: 1;
      border-top: 1px solid var(--clr-black-fade-out);
    }
  
    .viz-container {
      z-index: 1;
      position: relative;
    }

    

    .left-container {
      z-index: 1;
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
      z-index: 5;

      .collapsible {
        position: relative;

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

        .techsheet-wrapper {
          position: absolute;

          top: calc(4*var(--fs-label));
          right: calc(4*var(--fs-label));

          width: calc(3.6*var(--fs-label));
          height: calc(3.6*var(--fs-label));
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

        
        &__item {
          border-top: 1px solid var(--clr-black);
          border-bottom: 1px solid var(--clr-black);

          &:not(.no-border) {
            border-right: 1px solid var(--clr-black);
          }

          &.clear-all-btn {
            padding: 0 var(--fs-label);
          }

          &.project-logo {
            padding: 0 calc(2.4*var(--fs-label));
            
            display: flex;
            align-items: center;

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
              left: 30%;
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
            padding-right: calc(4*var(--fs-label));

            display: flex;
            align-items: center;
          }
        }
      }
    }


  }

</style>
