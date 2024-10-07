<script>
  // Lib
  import * as PIXI from "pixi.js"
  import { _ } from "svelte-i18n";
  import { get } from "svelte/store";
  import { gsap } from "gsap";

  // Stores
  import { app, selected, categories } from "$lib/stores";
  
  // Actions
  import castContainer from '$lib/actions/castContainer';

  // Components
	import Icon from '$lib/components/dom/atoms/Icon.svelte';
  import FileTrace from "$lib/components/webgl/atoms/FileTrace.svelte";

  export let nColumns = 1
  export let outerClose = false

  let container
  let traceIds = []
  let itemsByColumn = 0

  let project = ''
  let client = ''
  let description = ''
  let date = ''

  $: update($selected)

  function update(selected) {
    if (!selected) {
      return exit()
    }

    traceIds = [
      selected.channel,
      ...selected.products,
      ...selected.designs,
      ...selected.goals
    ]

    project = selected.project
    client = selected.client
    description = selected.description
    date = selected.date

    itemsByColumn = Math.ceil((traceIds.length)/nColumns)

    entrance()
  }

  function entrance() {
    if (!container) return

    const tl = gsap.timeline({ overwrite: true })
    
    tl
    .set(container, { display: "flex" })
    .fromTo(container, 
      { opacity: 0, y: -300, rotateY: 30, skewY: -30 }, 
      { opacity: 1, y: 0, rotateY: 0, skewY: 0 })
  }

  function exit() {
    if (!container) {
      return
    }

    const tl = gsap.timeline({ overwrite: true })

    tl
    .fromTo(container, 
      { opacity: 1, scale: 1, y: 0 }, 
      { opacity: 0, scale: 1.2, y: -20 })
    .set(container, { scale: 1, display: "none" })
    .add(() => {
      traceIds = []
      project = ''
      client = ''
      description = ''
      date = ''
    })
  }

  function onClick() {
    selected.set(null)
  }


</script>

<section bind:this={container} class="hidden absolute top-0 left-0 w-full h-full z-40 {!!$selected ? 'pointer-events-auto': 'pointer-events-none'} flex flex-col justify-center">

  <!-- Prev: .file -->
  <article class="max-w-full max-h-full mx-auto px-6 py-8 grid grid-rows-[max-content_minmax(auto,1fr)] gap-10 md:py-0 md:max-w-3xl md:grid-rows-none md:grid-cols-[max-content_minmax(auto,1fr)] overflow-hidden">

    <!-- Prev .file__traces ul -->
    <ul 
      class="row-start-2 md:row-start-1 md:col-start-1 gap-y-6 gap-x-2 content-center grid overflow-y-auto overflow-x-hidden pr-2"
      style:grid-template-columns="repeat({nColumns}, minmax(0,1fr))"
      style:grid-template-rows="repeat({itemsByColumn}, minmax(0,1fr))"
    >
      {#each traceIds as id, i (id)}
      {@const context = new PIXI.Container()}
      {@const category = $categories.find(d => d.id === id)}

        {#if category}
  
          <li class="grid grid-cols-[2rem_minmax(0,1fr)] gap-2.5 md:grid-cols-[2.25rem_minmax(0,1fr)] items-center">

            <!-- Prev .primitive-holder -->
            <figure 
              class="opacity-[inherit] aspect-square" 
              use:castContainer={{ 
                parent: get(app).stage.getChildByName('vis-container'), 
                context, 
                propagateOpacity: container 
              }}
            >
              <FileTrace {id} {context}/>
            </figure>
    
            <p class="text-xxs md:text-xs self-center lowercase underline">
              {$_("category." + category.id)}
            </p>
          </li>
        {/if}
      {/each}
    </ul>

    <!-- DESCRIPTION -->
    <div class="flex flex-col gap-3 justify-center md:py-8">

      <!-- Header -->
      <div class="flex flex-col">
          <h3 class="inline-block font-bold uppercase text-2xl md:text-3xl">{project}</h3>
          <h4 class="mt-1.5 underline text-lg">{client}</h4>
      </div>
    
      <!-- Body -->
      <p>
        {description}
      </p>
    
      <!-- Footer -->
      <div class="flex flex-col gap-4 items-start">
        <p class="underline">{date}</p>
    
        {#if !outerClose}
          <button class="stroke-black stroke-1 hover:stroke-primary hover:text-primary flex flex-col" on:click={onClick} >
            <figure class="w-10 h-10">
              <Icon icon="return"/>
            </figure>
            <p>{$_('file.back')}</p>
          </button>
        {/if}
      </div>
        
    </div>

  </article>

</section>
