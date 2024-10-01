<script>
  // Libraries
  import * as Tone from 'tone';
  import _ from 'lodash';
  import { gsap } from 'gsap';

  // DOM Elements
  import Button from "$lib/components/dom/atoms/Button.svelte";
  import Icon from "$lib/components/dom/atoms/Icon.svelte";

	import simulation from '$lib/simulation';

  import { PUBLIC_AWS_SOUND_BASE_URL } from '$env/static/public';
  import { onMount } from 'svelte';

  let playing
  let animation

  onMount(() => {
    simulation.sound.loadPlayers(PUBLIC_AWS_SOUND_BASE_URL)
  })

  function onClick() {
    playing = simulation.sound.togglePlaying()
  }

  $: if (playing) {
    animation = gsap.fromTo("#sound-icon path", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.2, repeat: -1 })
  } else if (animation) {
    animation.progress(1)
    animation.kill()
    animation = null
  }



</script>

<button 
  class="text-xxs w-full h-full py-0 px-4 grid grid-cols-[1.125rem_min-content_1.125rem] justify-center items-center gap-2.5 italic {playing ? "bg-primary fill-black text-black md:hover:bg-primary-300" : "bg-black fill-primary text-primary md:hover:text-secondary md:hover:fill-secondary"} transition-colors"
  on:click={onClick}
>
  <Icon icon={playing ? "pause" : "play"} />
  <span class="text-nowrap">play my vis!</span>

  <svg id="sound-icon" width="100%" height="100%" viewBox="0 0 32 33" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.64 18.9001C10.098 18.9001 11.28 17.7181 11.28 16.2601C11.28 14.8021 10.098 13.6201 8.64 13.6201C7.18197 13.6201 6 14.8021 6 16.2601C6 17.7181 7.18197 18.9001 8.64 18.9001Z"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1173 6.71289C19.3879 11.9834 19.3879 20.5366 14.1173 25.8071L12.7031 24.3929C17.1926 19.9034 17.1926 12.6166 12.7031 8.1271L14.1173 6.71289Z"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.9171 1.00293C28.3477 9.43345 28.3477 23.0966 19.9171 31.5271L18.5029 30.1129C26.1524 22.4635 26.1524 10.0666 18.5029 2.41714L19.9171 1.00293Z"/>
  </svg>
    

</button>

