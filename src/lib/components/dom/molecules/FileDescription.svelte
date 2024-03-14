<script>
	import Icon from '$lib/components/dom/atoms/Icon.svelte';

  import { selected, dataset } from "$lib/stores/nodes";

  function onClick() {
    selected.set({ active: false })
  }

</script>

<div class="file-description">

  <div class="file-description__header">
    <h3 class="project-name">IJEN</h3>
    <h4 class="project-client">Baboom Filmes</h4>
  </div>

  <div class="file-description__body">
    <ul class="project-tags">
      <li>Comunicação;</li>
      <li>Agência publicidade;</li>
      <li>Tipografia;</li>
    </ul>
  
    <p class="project-description">
      Infográficos animados para auxiliar na narrativa do documentário.
    </p>

  </div>

  <div class="file-description__footer">
    <p class="project-date">01/2014</p>

    <button on:click={onClick}>
      <Icon icon="return"/>
    </button>
  </div>

  
</div>

<style lang="scss">
  .file-description {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    row-gap: 1rem;

    &__header {
      display: flex;
      flex-direction: column;
      gap: 0;
      letter-spacing: .1em;

      .project-name {
        font-weight: 700;
        text-transform: uppercase;
      }

      .project-client {
        text-decoration: underline;
      }
    }

    &__body {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      row-gap: .75rem;

      ul.project-tags {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        column-gap: .5rem;
        row-gap: 0;

        li {
          display: inline;
          font-size: .8rem;
          font-weight: 500;
          letter-spacing: .1em;
        }
      }

    }

    &__footer {
      display: flex;
      flex-direction: column;
      row-gap: 0;

      .project-date {
        text-decoration: underline;
      }

      button {
        pointer-events: all;
        background: none;
        border: none;
        outline: none;
        width: 2.8rem;
        height: 2.8rem;

        stroke: var(--color-black);
        stroke-width: 1.15px;

        &:hover {
          stroke: var(--color-accent);
          stroke-width: 1.5px;
        }
      }
    }
  }

  p {
    font-size: .8rem;
  }


</style>