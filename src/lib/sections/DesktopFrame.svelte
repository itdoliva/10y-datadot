<script>
  // Libraries
  import * as PIXI from "pixi.js"

  import ProjectLogo from "$lib/components/dom/organisms/ProjectLogo.svelte"
  import LanguageChange from "../components/dom/organisms/LanguageChange.svelte";
  import InputLayout from "$lib/components/dom/organisms/InputLayout.svelte"
  import InputDesign from "$lib/components/dom/organisms/InputDesign.svelte"
  import InputPeriod from "$lib/components/dom/organisms/InputPeriod.svelte"
  import InputGoal from "$lib/components/dom/organisms/InputGoal.svelte"
  import InputProduct from "$lib/components/dom/organisms/InputProduct.svelte"
  import InputIndustry from "$lib/components/dom/organisms/InputIndustry.svelte"
  import ClearAllFilterButton from "$lib/components/dom/molecules/ClearAllFilterButton.svelte"
  import PlayButton from "$lib/components/dom/molecules/PlayButton.svelte"
  import Icon from "$lib/components/dom/atoms/Icon.svelte"
  import Button from "$lib/components/dom/atoms/Button.svelte"
  import Signals from "$lib/components/dom/molecules/Signals.svelte"
  import Visualization from "$lib/components/webgl/Visualization.svelte"
  import DropdownActivate from "$lib/components/dom/organisms/DropdownActivate.svelte"
  import DropdownSortBy from "$lib/components/dom/organisms/DropdownSortBy.svelte"
  import DropdownAll from "$lib/components/dom/organisms/DropdownAll.svelte"

  import File from "$lib/sections/File.svelte"

  import { width, isSheetOpen } from "$lib/stores"

  import castContainer from '$lib/actions/castContainer'

  const productContainer = new PIXI.Container()
  productContainer.name = "top-panel"

  export let layout

  let shrinkHeight
  let isShrinked = false

  function toggleTopMenuCollapse() {
    isShrinked = !isShrinked
    return 
  }
</script>

<div 
  id="root"
  class="w-full h-full relative overflow-hidden grid md:grid-rows-[auto_1fr] md:grid-cols-[240px_repeat(4,minmax(0,1fr))] xl:grid-cols-5"
>

  <section id="top-panel" class="col-start-2 col-span-full row-start-1 row-span-1 z-20">
    <article 
      id="shrink-panel"
      class="relative overflow-hidden transition-all duration-300 ease-in-out" 
      style:transform="translate(0, {isShrinked ? -1*shrinkHeight : 0}px)"
      style:max-height="{isShrinked ? 0 : shrinkHeight}px"
    >

      <div class="pt-12 pr-0 pb-6 pl-12" 
        bind:clientHeight={shrinkHeight}
        use:castContainer={{ 
          context: productContainer, 
          hasMask: true, 
          propagateOpacity: "#shrink-panel" 
        }}
      >
        <InputProduct parent={productContainer} />
      </div>

      <figure class="absolute top-12 right-12 w-10 h-10">
        <Button onClick={() => isSheetOpen.set(true)}>
          <Icon icon="infoDefault" />
        </Button>
      </figure>

    </article>

    <ul id="top-panel-menu"
      class="h-10 grid md:grid-cols-[auto_auto_max-content_max-content_minmax(0,1fr)_min-content] lg:grid-cols-[auto_auto_auto_max-content_max-content_minmax(0,1fr)_min-content]"
    >
      
      {#if $width >= 1024}
        <li id="sortby" class="border-y border-y-black border-r border-r-black">
          <DropdownSortBy />
        </li>

        <li id="activate" class="border-y border-y-black border-r border-r-black">
          <DropdownActivate />
        </li>
      {:else}
        <li id="sortby-activate" class="border-y border-y-black border-r border-r-black">
          <DropdownAll />
        </li>
      {/if}

      <li id="clear-all" class="border-y border-y-black border-r border-r-black py-0 px-3">
        <ClearAllFilterButton />
      </li>

      <li id="play-my-vis" class="border-y border-y-black border-r border-r-black">
        <PlayButton />
      </li>

      <li id="project-logo" class="border-y border-y-black px-8 h-full max-h-full">
        <div class="h-10 flex py-2">
          <ProjectLogo />
        </div>
      </li>

      <li id="shrink-button-wrapper" class="border-y border-y-black relative z-20 hidden lg:block">

        <figure class="absolute top-full left-1/3 -translate-y-1/2 w-8">
          <div class="rotate transition-transform duration-150 ease-in-out origin-center {isShrinked ? 'rotate-180' : 'rotate-0'}" >
            <Button 
              onClick={toggleTopMenuCollapse}
              colorDefault="var(--clr-white)"
              colorHover="var(--clr-accent)"
              colorActive="var(--clr-accent-low)"
            >
              <Icon icon="collapse"/>
            </Button>
          </div>
        </figure>

      </li>

      <li id="change-language" class="border-y border-y-black flex items-center">
        <div class="mr-12 z-40">
          <LanguageChange />
        </div>
      </li>

    </ul>
  </section>

  <section id="left-panel" class="col-start-1 col-span-1 row-start-1 row-span-full z-10 border-r border-r-black overflow-y-auto pt-12 pr-6 pb-6 pl-12 flex flex-col">

    <ul>
      <li class="pb-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-layout">
        <InputLayout bind:layout={layout} />
      </li>

      <li class="py-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-period">
        <InputPeriod /> 
      </li>

      <li class="py-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-design">
        <InputDesign />
      </li>

      <li class="py-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-goal">
        <InputGoal />
      </li>

      <li class="py-7 pr-6 pl-0 input-industry">
        <InputIndustry />
      </li>
    </ul>
  </section>

  <section id="vis-container" class="col-start-2 col-span-full row-start-2 relative">
    <Signals />
    <Visualization />
    <File />
  </section>

</div>