<script>
  import InputLayout from "$lib/components/organisms/InputLayout.svelte";
  import InputDesign from "$lib/components/organisms/InputDesign.svelte";
  import InputPeriod from "$lib/components/organisms/InputPeriod.svelte";
  import InputGoal from "$lib/components/organisms/InputGoal.svelte";
  import InputIndustry from "$lib/components/organisms/InputIndustry.svelte";

  export let layout
</script>

<ul class="pitems-wrapper pa-wrapper">

  <li>
    <InputLayout bind:layout />
  </li>

  <li>
    <InputPeriod />
  </li>

  <li>
    <InputDesign />
  </li>

  <li>
    <InputGoal />
  </li>

  <li>
    <InputIndustry />
  </li>
</ul>

<style lang="scss">
  .pa-wrapper  {
    list-style-type: none;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    li {
      padding-bottom: .8rem;
      margin-bottom: .8rem;

      &:not(:last-child) {
        border-bottom: .5px solid black;
      }
    }
  }
</style>