<script>
  // Lib
  import * as PIXI from "pixi.js"
  import { _ } from "svelte-i18n";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { gsap } from "gsap";

  // Stores
  import { selected, categories } from "$lib/stores/nodes";
  
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

    itemsByColumn = Math.ceil((traceIds.length + 1)/nColumns)

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
    if (!container) return

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

<div bind:this={container} class="container file" class:active={!!$selected}>

  <div class="file">

    <!-- TRACES -->
    <div class="file__traces">
      <ul style:--n-columns={nColumns} style:--items-by-column={itemsByColumn}>
        {#each traceIds as id, i (id)}
        {@const context = new PIXI.Container()}
        {@const category = $categories.find(d => d.id === id)}

          {#if category}
    
            <li>
              <div class="primitive-holder" use:castContainer={{ context, propagateOpacity: container }}>
                <FileTrace {id} {context}/>
              </div>
      
              <p class="label">
                {$_("category." + category.id)}
              </p>
            </li>
          {/if}
        {/each}
      </ul>
    </div>

    <!-- DESCRIPTION -->
    <div class="file__description">

      <div class="header">
        <div class="project-name">
            <h3>{project}</h3>
        </div>
          <h4 class="project-client">{client}</h4>
      </div>
    
      <div class="body">

        <p class="project-description">
          {description}
        </p>
      </div>
    
      <div class="footer">
        <p class="project-date">{date}</p>
    
        {#if !outerClose}
          <button on:click={onClick}>
            <Icon icon="return"/>
          </button>
        {/if}
      </div>
        
    </div>

    {#if outerClose}
      <button class="file__close" on:click={onClick} in:fly={{ y: 80, duration: 2000, delay: 1000 }}>
        <Icon icon="returnBackground"/>
      </button>
    {/if}

  </div>

</div>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .container {
    overflow: hidden;
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 10;

    pointer-events: none;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 0 calc(3.2*var(--fs-label));
    padding-top: calc(4.2*var(--fs-label));

    opacity: 0;

    @include md {
      padding: 0;
    }



    &.active {
      pointer-events: all;
    }


    .file {
      transition: opacity 1s ease-in-out;

      pointer-events: none;
      position: relative;

      width: 100%;
      height: 100%;
      
      display: grid;
      grid-template-rows: max-content 1fr;
      grid-template-areas: 
        "description"
        "traces";
      align-content: stretch;
      row-gap: calc(var(--fs-label)*3.6);


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
          width: 100%;
          
          position: relative;
          display: grid;
          grid-template-rows: repeat(var(--items-by-column), 1fr);
          grid-template-columns: repeat(var(--n-columns), 1fr);

          column-gap: calc(1.2*var(--fs-label));
          row-gap: calc(2*var(--fs-label));

          @include md {
            row-gap: calc(2*var(--fs-label));
          }

          align-content: center;

          li {
            display: grid;
            grid-template-columns: calc(var(--fs-label)*2.6) 1fr;
            grid-template-rows: calc(var(--fs-label)*2.2);
            column-gap: calc(var(--fs-label)*1.6);

            justify-content: end;
            align-items: center;

            @include md {
              grid-template-columns: calc(var(--fs-label)*3.2) 1fr;
              column-gap: calc(var(--fs-label)*2);
            }

            .primitive-holder {
              opacity: inherit;
              aspect-ratio: 1/1;
            }

            .label {
              align-self: center;
              text-transform: lowercase;
              text-decoration: underline;
              font-size: var(--fs-label);
            }

          }
        }
      }
  
      &__description {
        --fs-name: calc(var(--fs-label)*2.4);
        --fs-client: calc(var(--fs-label)*1.6);
        --fs-tags: var(--fs-label);
        --fs-desc: calc(var(--fs-label)*1.4);
        --fs-date: calc(var(--fs-label)*1.6);

        height: 100%;
        width: 100%;
        max-width: calc(var(--fs-label)*28);

        display: grid;
        justify-self: start;
        grid-auto-rows: min-content;

        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        row-gap: var(--fs-label);

        .header {
          display: flex;
          flex-direction: column;
          gap: 0;
          letter-spacing: .1em;

          .project-name {

            h3 {
              display: inline-block;
              font-weight: 700;
              text-transform: uppercase;
              font-size: var(--fs-name);
              
              // background: rgba(255, 255, 255, .8);
              background: var(--clr-black);
              color: var(--clr-white);

              @include md {
                background: none;
                color: var(--clr-black);
              }
            }
          }

          .project-client {
            text-decoration: underline;
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