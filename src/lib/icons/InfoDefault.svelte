<svg width="100%" height="100%" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">

  <path class="i-char default" d="M30.2201 33.0199V34.2299H20.3301V33.0199H24.6501V24.4699H21.2101V23.2599H25.9901V33.0199H30.2201ZM26.3001 21.1799H24.3701V18.8799H26.3001V21.1799Z"/>

  <path class="i-char active" d="M31.3798 31.0699V33.7199H19.7598V31.0699H24.0098V25.2399H20.4798V22.5899H27.1498V31.0799H31.3798V31.0699ZM27.4298 20.9599H23.7498V17.6499H27.4298V20.9599Z"/>

  <path class="underscore default" d="M13.8398 40.4902H36.3398"/>

  <path class="underscore active" d="M14.3398 39.9902H36.8398" />

  <path class="square default" d="M51.24 2.5H0.5V49.87H51.24V2.5Z"/>

</svg>

<style lang="scss">
  @import "$lib/scss/_breakpoints.scss";

  svg {
    .default { opacity: 1; }
    .active { opacity: 0; }

    background: var(--clr-black);

    &:hover {
      .default { opacity: 0; }
      .active { opacity: 1; }

      background: var(--clr-black);
    }

    .i-char {
      &.default {
        fill: var(--clr-gray);
      }

      &.active {
        fill: var(--clr-accent);
      }
    }

    .underscore {
      &.default {
        stroke: var(--clr-gray);
      }

      &.active {
        stroke: var(--clr-accent);
      }
    }

    @include md {
      background: none;
  
      .i-char {
        &.default {
          fill: var(--clr-black);
        }
  
        &.active {
          fill: var(--clr-accent);
        }
      }
  
      .underscore {
        &.default {
          stroke: var(--clr-black);
        }
  
        &.active {
          stroke: var(--clr-accent);
        }
      }
  
      .square {
        stroke: var(--clr-black);
      }
    }

  }
</style>