<script>
	import Icon from './../atoms/Icon.svelte';
  export let title
</script>

<div class="dropdown">
  <button class="link">
    <div class="icon-wrapper">
      <Icon icon='caret' />
    </div>
    <span>{title}</span>
  </button>
  <div class="dropdown-menu">
    <slot />
  </div>
</div>

<style lang="scss">
  .dropdown {

    position: relative;
    width: 100%;
    height: 100%;

    & > .link:focus + .dropdown-menu,
    &:hover > .dropdown-menu {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    & > .link:focus > .icon-wrapper,
    &:hover .link .icon-wrapper {
      transform: rotate(0);
    }

    .link {
      padding: 0 1rem;

      display: grid;
      grid-template-columns: min-content 1fr;
      align-content: center;

      width: 100%;
      height: 100%;
      border: none;
      background: none;

      font-family: inherit;
      font-size: inherit;
      cursor: pointer;
      
      text-align: left;

      .icon-wrapper {
        align-self: center;
        width: 1rem;
        transform: translateY(-.085rem) rotate(-90deg);
        transition: transform 150ms ease-in-out;
      }
    }

    .dropdown-menu {
      position: absolute;

      padding: 1rem;

      min-width: calc(100% + 2px);
      left: -1px;
      top: 100%;
      background-color: hsla(0, 0%, 100%, .9);
      border: 1px solid black;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-.15rem);
      transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;
      z-index: 10;
    }
  }


</style>