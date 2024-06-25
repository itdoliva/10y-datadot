<script>
  // Libraries
  import * as Tone from 'tone';
  import _ from 'lodash';

  // DOM Elements
  import Button from "$lib/components/dom/atoms/Button.svelte";
  import Icon from "$lib/components/dom/atoms/Icon.svelte";

	import simulation from '$lib/simulation';

  import { PUBLIC_AWS_SOUND_BASE_URL } from '$env/static/public';
  import { onMount } from 'svelte';

  let playing

  onMount(() => {
    simulation.sound.loadPlayers(PUBLIC_AWS_SOUND_BASE_URL)
  })

  function onClick() {
    playing = simulation.sound.togglePlaying()
  }



</script>

<Button {onClick}>
  <div class="container" class:active={playing}>
    <Icon icon={playing ? "pause" : "play"} />
    <span>play my vis!</span>
    <Icon icon="wireless" />
  </div>
</Button>

<style lang="scss">

  .container {
    --icn-width: calc(var(--fs-label)*1.5);

    width: 100%;
    height: 100%;

    padding: 0 1rem;

    display: grid;
    grid-template-columns: var(--icn-width) min-content var(--icn-width);
    justify-content: center;
    align-items: center;
    gap: .6rem;

    font-size: var(--fs-label);
    font-weight: 600;
    font-style: italic;

    background: var(--clr-black);
    fill: var(--clr-accent);
    color: var(--clr-accent);

    &.active {
      background: var(--clr-accent);
      fill: var(--clr-black);
      color: var(--clr-black);
    }

    &:not(.active) {
      &.hover {
        background: var(--clr-black);
        fill: var(--clr-accent-low);
        color: var(--clr-accent-low);
      }
    }
    
  }

</style>