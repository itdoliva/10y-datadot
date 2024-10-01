<script>
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
  import File from "$lib/sections/File.svelte"

  import { fly } from "svelte/transition";

  import { _ } from "svelte-i18n";

  import onClickOutside from "$lib/actions/onClickOutside"
  import { selected, isFilterOpen, isToggleHidden, isSheetOpen } from "$lib/stores"

  export let layout


  function openFilter() {
    isFilterOpen.set(true)
  }

  function closeFilter() {
    isFilterOpen.set(false)
  }

  function unselectNode() {
    selected.set(null)
  }

  function openSheet() {
    isSheetOpen.set(true)
  }

</script>

<div id="root" class="w-full h-full overflow-hidden grid grid-rows-[max-content_minmax(0,1fr)_max-content_max-content]">

  <!-- Header -->
  <section id="mobile-header" class="row-start-1 z-10 px-6 pt-7 pb-3.5 flex justify-between items-end border-b border-b-black border-opacity-50">

    <div class="logo-container">
      <ProjectLogo />
    </div>

    <div class="options-wrapper flex flex-col justify-between items-end">
      <LanguageChange />
    </div>

  </section>


  <section class="row-start-2 z-20 w-full flex relative">
    
    <article id="vis-container" class="w-full">
      <Signals />
      <Visualization />
      <File nColumns=2 outerClose={true} />

    </article>

    <article id="filter-container" class="absolute overflow-hidden top-0 left-0 w-full h-[110%] pointer-events-none">

      <button class="bg-black text-white absolute top-4 right-0 border-none rounded-tl-[1rem] rounded-bl-[1rem] p-3 transition-transform ease-in-out {$isToggleHidden ? 'translate-x-full duration-200 pointer-events-none' : 'duration-[750ms] delay-500 pointer-events-auto'}" 
        on:click={openFilter}
      >
        <p>&gt; {$_("menu.filters")}</p>
      </button>


      <aside class="pointer-events-auto absolute top-0 right-0 w-[85vw] h-full grid grid-rows-[minmax(0,1fr)_min-content] bg-black border border-white border-r-black rounded-tl-[3rem] rounded-bl-[3rem] transition-transform duration-500 ease-in-out overflow-hidden {$isFilterOpen ? 'translate-x-0' : 'translate-x-full'}" 
        use:onClickOutside 
        on:outsideclick={closeFilter}
      >

        <ul class="overflow-y-auto overflow-x-hidden pt-0 pb-8 pl-10 pr-4">

          <li class="border-b border-b-white border-opacity-50 py-8 pr-8 pl-0">
            <InputPeriod theme="on-dark"/> 
          </li>

          <li class="border-b border-b-white border-opacity-50 py-8 pr-8 pl-0">
            <InputDesign theme="on-dark"/>
          </li>

          <li class="border-b border-b-white border-opacity-50 py-8 pr-4 pl-0">
            <InputGoal nColumns=2 theme="on-dark"/>
          </li>

          <li class="border-b border-b-white border-opacity-50 py-8 pr-4 pl-0">
            <InputProduct nColumns=2 theme="on-dark"/>
          </li>

          <li class="py-8 pr-4 pl-0">
            <InputIndustry theme="on-dark"/>
          </li>

        </ul>

        <div class="grid grid-cols-5 h-16 border-t border-white border-opacity-50 pl-10">

          <div class="col-span-4">
            <ClearAllFilterButton />
          </div>

          <div class="p-2 border-l border-l-white border-opacity-50 flex items-center justify-center">
            <button class="clean-btn" on:click={closeFilter}>
              <p class="text-white text-2xl font-bold mx-auto">X</p>
            </button>
          </div>

        </div>

      </aside>

    </article>
  </section>



  <section id="layout-container" class="row-start-3 z-10 border-t flex justify-center items-center border-t-black border-opacity-50 h-12">
    
    {#if !$selected}

      <div in:fly={{ y: -12 }}>
        <InputLayout bind:layout direction="row"/>
      </div>

    {:else}

      <button class="grid grid-cols-[repeat(2,min-content)] items-center justify-end gap-2.5" on:click={unselectNode} in:fly={{ y: -12 }}>
        <figure class="w-6 h-6 stroke-black">
          <Icon icon="return" />
        </figure>
        <p>{$_("file.back")}</p>
      </button>

    {/if}
  </section>

  <section id="play-my-vis" class="row-start-4 z-10 h-12 border-t border-t-black border-opacity-50 grid grid-cols-[min-content_minmax(0,1fr)]">

    <figure class="h-full aspect-square border-r border-r-dark-gray">
      <Button onClick={openSheet}>
        <Icon icon="infoDefault" />
      </Button>
    </figure>

    <PlayButton />
  </section>
</div>