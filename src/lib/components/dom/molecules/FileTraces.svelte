<script>
  // Libraries
  import * as PIXI from "pixi.js"
  import { _ } from "svelte-i18n";

  // Stores
  import { selected, categories } from "$lib/stores/nodes";

  // Actions
  import castContainer from '$lib/actions/castContainer';

  // WebGL Components
  import FileTrace from "$lib/components/webgl/atoms/FileTrace.svelte";
  
  const node = $selected

  const traceIds = [
    node.channel,
    ...node.products,
    ...node.designs,
    ...node.goals,
  ]

</script>

<ul class="file-traces">
  {#each traceIds as id}
  {@const context = new PIXI.Container()}
  {@const category = Object.values($categories).flat().find(d => d.id === id)}
    <li class="file-traces__item">

      <div class="primitive-holder" use:castContainer={{ context }}>
        <FileTrace {id} {context}/>
      </div>

      <p class="label">
        {$_(category.alias)}
      </p>

    </li>
  {/each}
</ul>

<style lang="scss">
  .file-traces {
    width: 100%;
    height: 100%;
    
    display: grid;
    grid-auto-flow: row;
    grid-auto-rows: min-content;

    gap: 1rem;

    align-content: center;

    &__item {
      display: grid;
      grid-template-columns: calc(var(--fs-label)*3.2) 1fr;
      grid-template-rows: calc(var(--fs-label)*2.2);
      gap: calc(var(--fs-label)*2);

      justify-content: end;
      align-items: center;

      .primitive-holder {
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
</style>