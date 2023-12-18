<script>
  import {
    designEditorial,
    designIllustration,
    designMotion,
    designService,
    designUI,
    productDashboard,
    productInfographic,
    productPresentation,
    productPublication,
    productReport,
    productSiteEditorial,
    productSiteInstitutional,
    productVideo,
    goal,
  } from "$lib/drawers"

  import { 
    categories,
    goals,
    channels,
    designs,
    products
  } from "$lib/store/categories"

	import { isDragging } from '$lib/store/canvas';

	import rotateAroundPoint from '$lib/helpers/rotateAroundPoint'
  import Path from "$lib/components/atoms/Path.svelte";

  export let node
  export let x = 0
  export let y = 0
  export let rotation = undefined

  $: center = [ x, y ]

  function rotate(arr, theta=0) {
    // Rotates an array of points [x1, y1, x2, y2, ...] around the center
    // based on rotation and provided theta

    let angle = theta
    
    if (rotation !== undefined) {
      angle += rotation + Math.PI/2 // Add 90 deg since 0 deg is horizontal in radial layout
    }

    const rotated = []
    for (let i=0; i<arr.length/2; i++) {
      const pair = arr.slice(i*2, i*2+2)
      rotated.push(...rotateAroundPoint(...pair, x, y, angle))
    }

    return rotated
  }


  function getRotation() {
    return rotation !== undefined ? rotation + Math.PI/2 : 0
  }


  function translate(arr) {
    // Translate given array of a point [x1, y1, x2, y2, ...] to the center of the unit
    return arr.map((d, i) => d + center[i%2])
  }


  function transform(arr) {
    // Transform a give array of points [[x1, x2], [x1, x2]...]
    if (Array.isArray(arr[0])) {
      return arr.map(p => rotate(translate(p)))
    }
    return rotate(translate(arr))
  }


  function makeChannel(ctx) {
    ctx.beginPath()

    // Consulting (circle)
    if (node.channel === 2) {
      return ctx.arc(x, y, $channels.consulting, 0, 2*Math.PI)
    }

    // Digital or Print (regular polygon)
    const points = transform($channels[node.channel === 0 ? 'digital' : 'print'])
    ctx.linkEdges(points)
  }


</script>

{#if x !== undefined && y !== undefined}
<!-- BEHIND BASIS -->
{#if node.designs.includes(0)}
  <Path canvas="main" makePath={designIllustration($designs.illustration, { transform })} />
{/if}

{#if node.designs.includes(1)}
  <Path canvas="main" makePath={designEditorial($designs.editorial, { transform })} />
{/if}

{#if node.designs.includes(3)}
  <Path canvas="main" makePath={designService($designs.service, { transform })} />
{/if}

{#if node.designs.includes(4)}
  <Path canvas="main" makePath={designUI($designs.ui, { transform })} />
{/if}


<!-- BASIS -->
<Path canvas="main" makePath={makeChannel} fill={['white']} stroke={['black']} />


<!-- FRONT OF BASIS -->
{#if node.products.includes(6)}
  <Path canvas="main" makePath={productDashboard($products.dashboard, { transform, makeChannel })} />
{/if}

{#if node.products.includes(7)}
  <Path canvas="main" makePath={productInfographic($products.infographic, { transform, makeChannel })} />
{/if}

{#if node.designs.includes(2)}
  <Path canvas="main" makePath={designMotion($designs.motion, { transform })} />
{/if}

{#if node.products.includes(0)}
  <Path canvas="main" makePath={productVideo($products.video, { transform })} />
{/if}

{#if node.products.includes(1)}
  <Path canvas="main" makePath={productPublication($products.publication, { transform })} />
{/if}

{#if node.products.includes(2)}
  <Path canvas="main" makePath={productReport($products.report, { transform })} />
{/if}

{#if node.products.includes(3)}
  <Path canvas="main" makePath={productPresentation($products.presentation, { transform })} />
{/if}

{#if node.products.includes(4)}
  <Path canvas="main" makePath={productSiteInstitutional($products.siteInstitutional, { transform })} />
{/if}

{#if node.products.includes(5)}
  <Path canvas="main" makePath={productSiteEditorial($products.siteEditorial, { transform, getRotation })} />
{/if}

<!-- {#if !$isDragging}
  {#each node.goals as id}
    <Path canvas="goals" makePath={goal($goals[id], { transform, getFillStyle: () => $categories.goals.find(d => d.id === id).color })} />
  {/each}
{/if} -->
{/if}