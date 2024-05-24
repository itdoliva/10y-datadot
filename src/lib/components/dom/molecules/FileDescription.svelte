<script>
  import Icon from '$lib/components/dom/atoms/Icon.svelte';

  export let onClick
  export let outerClose

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

    {#if !outerClose}
      <button on:click={onClick}>
        <Icon icon="return"/>
      </button>
    {/if}
  </div>
  
</div>

<style lang="scss">
  .file-description {
    --fs-name: calc(var(--fs-label)*2.4);
    --fs-client: calc(var(--fs-label)*1.6);
    --fs-tags: var(--fs-label);
    --fs-desc: calc(var(--fs-label)*1.4);
    --fs-date: calc(var(--fs-label)*1.6);

    width: 100%;
    max-width: calc(var(--fs-label)*28);

    display: flex;
    flex-direction: column;
    align-items: stretch;
    row-gap: var(--fs-label);

    &__header {
      display: flex;
      flex-direction: column;
      gap: 0;
      letter-spacing: .1em;

      .project-name {
        font-weight: 700;
        text-transform: uppercase;
        font-size: var(--fs-name);
      }

      .project-client {
        text-decoration: underline;
        font-size: var(--fs-client);
      }
    }

    &__body {
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

    &__footer {
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


</style>