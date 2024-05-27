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

  export let nColumns = 1
  

  $: traceIds = [
    $selected.channel,
    ...$selected.products,
    ...$selected.designs,
    ...$selected.goals,
  ]

  $: itemsByColumn = Math.ceil((traceIds.length + 1)/nColumns)

</script>

<div class="file-traces">
  <ul 
    style:--n-columns={nColumns}
    style:--items-by-column={itemsByColumn}
  >
    {#each traceIds as id}
    {@const context = new PIXI.Container()}
    {@const category = Object.values($categories).flat().find(d => d.id === id)}
      <li>

        <div class="primitive-holder" use:castContainer={{ context }}>
          <FileTrace {id} {context}/>
        </div>

        <p class="label">
          {$_(category.alias)}
        </p>

      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  @import "$lib/scss/breakpoints.scss";

  .file-traces {
    ul {
      width: 100%;
      
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
</style>