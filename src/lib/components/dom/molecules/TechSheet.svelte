<script lang="ts">
  import { _ } from "svelte-i18n";
  import { isOpen } from "../../../stores/techsheet"
  import Icon from "../atoms/Icon.svelte";

  function handleClose() {
    isOpen.set(false)
  }
</script>

<div class="techsheet-layer" class:open={$isOpen}>

  <div class="techsheet-panel">

    <div class="techsheet-close-wrapper">
      <button class="clean-btn" on:click={handleClose}>
        <Icon icon="closeX"/>
      </button>
    </div>

    <div class="techsheet-content">
      <div class="techsheet-content__body">
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

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";
  
  .techsheet-layer {
    position: absolute;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    z-index: 9999;

    background: rgba(255, 255, 255, .4);

    display: none;
    opacity: 0;

    transition: opacity .15s ease-in-out;
    
    &.open {
      display: block;
      opacity: 1;

      .techsheet-panel {
        top: 52%;
      }

    }


    .techsheet-panel {
      border: 2px solid var(--clr-black);
      background: var(--clr-white);

      max-height: 95vh;
      width: 90vw;

      transition: top .15s ease-in-out;

      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      @include md {
        width: auto;
        max-width: calc(48*var(--fs-label));
      }

      .techsheet-close-wrapper {
        width: calc(2.4*var(--fs-label));
        height: calc(2.4*var(--fs-label));

        margin-left: auto;

        position: fixed;
        bottom: 0;
        right: 0;

        transform: translate(-50%, 50%);
        
        @include md {
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

      .techsheet-content {
        padding: calc(2.4*var(--fs-label));
        overflow-y: hidden;

        @include md {
          padding: calc(3.6*var(--fs-label));
        }
        
        &__body {
          overflow-y: auto;

          display: flex;
          flex-direction: column;
          gap: calc(1.4*var(--fs-label));

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
</style>