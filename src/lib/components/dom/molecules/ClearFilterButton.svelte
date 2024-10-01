<script>
  import { _ } from 'svelte-i18n'

  // DOM Elements
  import Button from "$lib/components/dom/atoms/Button.svelte"

  export let onClick
  export let disabled
  export let uppercase = false

</script>

<button 
  class="clear-filter-button"
  on:click={onClick}
  {disabled}
>
    <p class="w-full text-left font-inherit text-nowrap text-xxs {uppercase ? "uppercase" : ""}">
      <slot>
        <span class="font-inherit underline">
            {$_("input.unselect")}
        </span>
      </slot>
    </p>
</button>

