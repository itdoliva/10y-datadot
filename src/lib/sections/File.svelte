<script>
  // Lib
  import * as PIXI from "pixi.js"
  import { _ } from "svelte-i18n";
  import { get } from "svelte/store";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
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

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .container {
    // overflow: hidden;
    // position: absolute;

    // top: 0;
    // left: 0;
    // width: 100%;
    // height: 100%;

    // z-index: 10;

    // pointer-events: none;

    // display: flex;
    // flex-direction: column;
    // justify-content: center;

    // padding: 0 calc(3.2*var(--fs-label));

    // opacity: 0;

    // overflow: auto;

    // @include md {
    //   padding: 0;
    // }

    &.active {
      // pointer-events: all;
    }

    .file {
      // padding: calc(4.2*var(--fs-label)) 0;

      // transition: opacity 1s ease-in-out;

      // pointer-events: none;
      // position: relative;

      
      // display: grid;
      // grid-template-rows: max-content 1fr;
      // grid-template-areas: 
      //   "description"
      //   "traces";
      // align-content: stretch;
      // row-gap: calc(var(--fs-label)*3.6);


      @include md {
        grid-template-rows: none;
        grid-template-columns: repeat(2, 1fr);
        grid-template-areas: "traces description";
        column-gap: calc(var(--fs-label)*3.6);
        row-gap: 0;
      }


      &__traces, &__description {
        height: 100%; 
      }

      &__traces { grid-area: traces; }
      &__description { grid-area: description; }

      &__traces {
        align-self: stretch;

        display: flex;
        align-items: flex-start;
        height: 100%;
        
        @include md {
          justify-self: end;
          align-items: center;
        }

        ul {
          // width: 100%;
          
          // position: relative;
          // display: grid;
          // grid-template-rows: repeat(var(--items-by-column), 1fr);
          // grid-template-columns: repeat(var(--n-columns), 1fr);

          // column-gap: calc(1.2*var(--fs-label));
          // row-gap: calc(2*var(--fs-label));
          // align-content: center;

          @include md {
            // row-gap: calc(2*var(--fs-label));
          }


          li {
            // display: grid;
            // grid-template-columns: calc(var(--fs-label)*2.6) 1fr;
            // grid-template-rows: calc(var(--fs-label)*2.2);
            // column-gap: calc(var(--fs-label)*1.6);

            // justify-content: end;
            // align-items: center;

            @include md {
              // grid-template-columns: calc(var(--fs-label)*3.2) 1fr;
              // column-gap: calc(var(--fs-label)*2);
            }

            .primitive-holder {
              // opacity: inherit;
              // aspect-ratio: 1/1;
            }

            .label {
              // align-self: center;
              // text-transform: lowercase;
              // text-decoration: underline;
              // font-size: var(--fs-label);
            }

          }
        }
      }
  
      &__description {
        --fs-name: calc(var(--fs-label)*2);
        --fs-client: calc(var(--fs-label)*1.4);
        --fs-tags: var(--fs-label);
        --fs-desc: var(--fs-label);
        --fs-date: calc(var(--fs-label)*1.2);

        @include md {
          --fs-name: calc(var(--fs-label)*2.4);
          --fs-client: calc(var(--fs-label)*1.6);
          --fs-desc: calc(var(--fs-label)*1.2);
          --fs-tags: calc(var(--fs-label)*1.2);
          --fs-date: calc(var(--fs-label)*1.4);
        }

        // height: 100%;
        // width: 100%;
        // max-width: calc(var(--fs-label)*28);

        // display: grid;
        // justify-self: start;
        // grid-auto-rows: min-content;

        // display: flex;
        // flex-direction: column;
        // align-items: stretch;
        // justify-content: center;
        // row-gap: var(--fs-label);

        .header {
          // display: flex;
          // flex-direction: column;
          // gap: 0;
          letter-spacing: .1em;

          .project-name {

            h3 {
              // display: inline-block;
              // font-weight: 700;
              // text-transform: uppercase;
              font-size: var(--fs-name);
              // line-height: 1;

              // color: var(--clr-black);
            }
          }

          .project-client {
            // margin-top: .6em;
            // text-decoration: underline;
            font-size: var(--fs-client);
          }
        }

        .body {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          row-gap: var(--fs-label);

          ul.project-tags {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            column-gap: var(--fs-label);
            row-gap: 0;

            li {
              display: inline;
              font-size: var(--fs-tags);
              font-weight: 500;
              letter-spacing: .1em;
            }
          }

          .project-description {
            font-size: var(--fs-desc);
          }

        }

        .footer {
          display: flex;
          flex-direction: column;
          row-gap: 0;

          .project-date {
            text-decoration: underline;
            font-size: var(--fs-date);
          }

          button {
            pointer-events: all;
            background: none;
            border: none;
            outline: none;
            width: calc(var(--fs-label)*4.8);
            height: calc(var(--fs-label)*4.8);

            stroke: var(--clr-black);
            stroke-width: clump(1.15px, calc(var(--fs-label)/12), 4px);

            &:hover {
              stroke: var(--clr-accent);
            }
          }
        }
      }

      &__close {
        position: absolute;
        bottom: var(--fs-label);
        right: 50%;
        transform: translate(50%, 0);

        pointer-events: all;
        background: none;
        border: none;
        outline: none;
        width: calc(var(--fs-label)*6.4);
        height: calc(var(--fs-label)*6.4);

        stroke: var(--clr-white);
        stroke-width: clump(1.15px, calc(var(--fs-label)/12), 4px);

        &:hover {
          stroke: var(--clr-accent);
        }
      }
    }

  }


</style>