<script lang="ts">
  import { _ } from "svelte-i18n";
  import { gsap } from "gsap";
  import { isOpen } from "../../../stores/techsheet"
  import Icon from "../atoms/Icon.svelte";

  let wrapper

  $: if (wrapper && $isOpen) {
    const tl = gsap.timeline({ 
      overwrite: true,
      onStart: addOpenClass,
    })

    tl
      .fromTo(".techsheet-backdrop", { opacity: 0 }, { opacity: 1, duration: .15 })
      .fromTo(".techsheet-panel", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, "<")
  } 

  else if (wrapper && !$isOpen) {
    const tl = gsap.timeline({ 
      overwrite: true,
      onComplete: removeOpenClass,
      onInterrupt: removeOpenClass
    })

    tl
      .to(".techsheet-backdrop", { opacity: 0, duration: .5 })
      .to(".techsheet-panel", { y: -12, opacity: 0, duration: .3 }, "<")
  }

  function handleClose() {
    isOpen.set(false)
  }

  function addOpenClass() {
    if (!wrapper) return
    wrapper.classList.add("open")
  }

  function removeOpenClass() {
    if (!wrapper) return
    wrapper.classList.remove("open")
  }

</script>

<div bind:this={wrapper} class="techsheet">
  
  <div class="techsheet-backdrop" />

  <div class="techsheet-panel-wrapper">

    <!-- Adding the extra div below allows us to add some transform transition -->
    <div class="techsheet-panel">

      <div class="close-wrapper">
        <button class="clean-btn" on:click={handleClose}>
          <Icon icon="closeX"/>
        </button>
      </div>

      <div class="content">

        <div class="content__body">
          <h3>datadot {$_("page.hero")}</h3>
    
          <div>
            <p>{$_("techsheet.main")}</p>
            <p><strong>{$_("techsheet.encourage")}</strong></p>
          </div>
    
          <div>
            <h5>{$_("techsheet.made-by")}</h5>  
            <ul>
              <li><strong>Flávia Marinho</strong> ({($_("techsheet.roles.flavia"))})</li>
              <li><strong>Otávio Burin</strong> ({($_("techsheet.roles.otavio"))})</li>
              <li><strong>Italo Oliveira</strong> ({($_("techsheet.roles.italo"))})</li>
              <li><strong>Quintino Andrade</strong> ({($_("techsheet.roles.quintino"))})</li>
              <li><strong>Ludmila Souza</strong> ({($_("techsheet.roles.ludmila"))})</li>
              <li><strong>Gabriel Maciel</strong> ({($_("techsheet.roles.gabriel"))})</li>
            </ul>
          </div>
    
          <div>
            <a href="https://datadotestudio.com/" target="_blank">datadot.com.br</a>
          </div>
        </div>

      </div>

    </div>

  </div>

</div>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";
  
  .techsheet {
    position: fixed;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    z-index: 9999;

    display: none;

    &:global(.open) {
      display: block;
    }

    // Correct height
    // It shouldn't hide overflow to prevent cutting the close btn
    .techsheet-panel-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .techsheet-panel {
        display: flex;
        flex-direction: column;

        width: 90vw;
        max-height: 80vh;

        @include md {
          width: auto;
          max-width: calc(48*var(--fs-label));
        }

        .close-wrapper {
          width: calc(3.2*var(--fs-label));
          height: calc(3.2*var(--fs-label));
  
          margin-left: auto;
  
          position: fixed;
          bottom: 0;
          right: 0;
  
          transform: translate(-30%, 50%);
          
          @include md {
            width: calc(2.4*var(--fs-label));
            height: calc(2.4*var(--fs-label));

            bottom: auto;
            top: 0;
            transform: translate(-50%, -50%);
          }
  
  
          button {
            padding: 0;
            width: 100%;
            height: 100%;
  
            background: var(--clr-black);
            border-radius: 99rem;
  
            color: var(--clr-accent);
            cursor: pointer;
  
            &:hover {
              color: var(--clr-accent-hover);
            }
          }
        }

        .content {
          flex: 1;

          border: 2px solid var(--clr-black);
          background: var(--clr-white);

          overflow: hidden;

          display: flex;
          
          &__body {
            padding: calc(2.4*var(--fs-label));
            overflow-y: auto;
            max-height: 100%;

            flex: 1;
  
            display: grid;
            grid-auto-flow: row;
            gap: calc(1.4*var(--fs-label));

  
            @include md {
              padding: calc(3.6*var(--fs-label));
            }
  
            p {
              font-size: var(--fs-label);
              margin: var(--fs-label) 0;
  
              @include md {
                font-size: calc(1.1*var(--fs-label));
              }
            }
  
            ul {
              li {
                font-size: var(--fs-label);
  
                @include md {
                  font-size: calc(1.1*var(--fs-label));
                }
              }
            }
  
            h5 {
              margin-bottom: var(--fs-label);
            }
          }
  
        }
      }

    }

    .techsheet-backdrop {
      position: absolute;

      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      background: rgba(255, 255, 255, .8);
    }
  }
</style>