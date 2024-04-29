<script>
  import { _, locale } from 'svelte-i18n'

  const options = [
    { value: "pt", alias: "PT" },
    { value: "en", alias: "EN" },
  ]

  let selectedLanguage = $locale.slice(0, 2)

  $: locale.set(selectedLanguage.slice(0, 2))
</script>

<fieldset>
  {#each options as { value, alias }}
    <label>
      <input type="radio" value={value} bind:group={selectedLanguage} name="language-change" />
      <span>{alias}</span>
    </label>
  {/each}
</fieldset>

<style lang="scss">
  fieldset {
    border: none;
    padding: 0;
    margin: 0;

    display: flex;
    flex-direction: row;
    gap: var(--fs-label);
    
    label {
      
      input {
        display: none;

        &:checked + span {
          font-weight: 700;
        }

        &:not(:checked):hover + span {
          font-weight: 500;
          color: var(--clr-accent);
        }

      }

      span {
        font-size: calc(1.2*var(--fs-label));
      }
    }
  }
</style>


<!-- <select bind:value={selectedLanguage}>
  <option value="en">EN</option>
  <option value="pt">PT</option>
</select> -->