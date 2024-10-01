<script>
	import { remove } from 'lodash';
  // Libraries
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import textures from "textures";
  import { gsap } from "gsap";
  import { _, locale } from "svelte-i18n";

  // Stores
  import { categoriesEnriched, nodeSize, lineWidth } from "$lib/stores/nodes";
  import { width } from "$lib/stores/canvas";

  // DOM Components
  import ClearFilterButton from "$lib/components/dom/molecules/ClearFilterButton.svelte";

  import wrapSVGText from '$lib/utility/wrapSVGText';

  export let selected = []
  export let disabled

  let w
  let h

  let simulation
  let nodes = []
  let nodesG

  let initialized = false
  let svg

  let areaScale
  let rScale
  let collideRadius

  const texture = textures
    .circles()
    .size($nodeSize/2)
    .radius($lineWidth)
    .complement()
    .fill("#818afa")

  const forceCollide = d3.forceCollide().strength(.9)

  simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(10))
    .force("center", d3.forceCenter().x(0).y(0).strength(.5))
    .force("collide", forceCollide)
    .on('tick', tick)

  onMount(() => {

    areaScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, ($width >= 768 ? 20000 : 12500) * ($nodeSize/10)])

    rScale = (v) => Math.sqrt(areaScale(v)/(2*Math.PI)) + 5
    collideRadius = (d) => rScale(d.v) + ($width >= 768 ? 5 : 15)

    updateForceCollideRadius()

    nodes = $categoriesEnriched.filter(d => d.type === 'industry').map(d => {
      const r = rScale(d.pctNodes)
      return {
        id: d.id,
        name: d.name,
        v: d.pctNodes,
        r: r,
        r1: r
      }
    })


    nodesG = d3.select(svg)
      .call(texture)
    .select('.chart')
    .selectAll('.bs-bubble')
      .data(nodes)
      .enter()
    .append('g')
      .attr('id', d => `bs-bubble-${d.id.replace('.', '_')}`)
      .attr('class', 'bs-bubble')
      .style('cursor', 'pointer')
      .on('mouseover', bringToFront)
      .on('click', (e, d) => toggle(d.id))

    nodesG.append('circle')
      .attr('class', 'outer')
      .attr('r', d => d.r1)
      .attr('fill', texture.url())
      .attr('stroke-width', $lineWidth)

    nodesG.append('circle')
      .attr('class', 'inner')
      .attr('r', 2.4*$lineWidth)

    const textG = nodesG.append('g')
      .attr('class', 'text')
      .attr('font-size', '1rem')

    textG.append('text')
      .attr("class", "percentage")
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('dy', '-.15em')
      .text(d => Math.round(d.v*100) + "%")

    textG.append('text')
      .attr("class", "label")
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('dy', '1.35em')
      .attr('filter', 'url(#text-bg)')

    simulation.nodes(nodes)

    initialized = true

    setLabels()
  })  


  $: updateNodes($categoriesEnriched)
  $: $locale && setLabels()
  $: selected && markActive()

  function setLabels() {
    if (!initialized) return

    nodesG.selectAll('text.label')
      .each(function (d) {
        const text = $_("category." + d.id)
        d3.select(this)
          .call(wrapSVGText, { maxWidth: 120, text })
      })
  }

  function updateNodes(categoriesEnriched) {
    if (!initialized) return

    nodes.forEach(node => {
      const curPct = categoriesEnriched.find(d => d.id === node.id).pctNodes

      node.v = curPct
      node.r1 = rScale(curPct)

      const el = d3.select(`#bs-bubble-${node.id.replace('.', '_')} circle.outer`)
      
      gsap.to(node, { 
        r: node.r1, 
        duration: .5, 
        ease: 'power2.out', 
        onUpdate: () => el.attr('r', node.r) 
      })

    })

    updateForceCollideRadius()

    nodesG
      .data(nodes)
    .select('.percentage')
      .style('display', d => d.v > 0 ? '' : 'none')
      .text(d => Math.round(d.v * 100) + "%");

    simulation.nodes(nodes);
    simulation.alpha(1).restart();
  }


  function tick() {
    if (!initialized) return
    nodesG.attr('transform', d => `translate(${d.x}, ${d.y})`)
  }
  

  function toggle(id) {
    if (disabled) return
    
    if (selected.includes(id)) {
      const index = selected.indexOf(id)
      selected.splice(index, 1)
    } 
    else {
      selected.push(id)
    }

    selected = [...selected]
    
    updateForceCollideRadius()
  }

  function updateForceCollideRadius() {
    forceCollide.radius(collideRadius)
  }

  function markActive() {
    if (nodesG) nodesG.classed('active', d => selected.includes(d.id))
  } 

  function bringToFront() {
    const parent = this.parentNode
    const el = parent.removeChild(this)
    parent.appendChild(el)
  }

</script>


<div class="h-80 md:h-64 grid grid-rows-[1fr_min-content]">
  <div class="w-full h-full" bind:clientWidth={w} bind:clientHeight={h}>
    <svg class="w-full h-full overflow-visible relative" bind:this={svg}>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="text-bg">
          <feFlood flood-color="var(--clr-accent-low)" result="bg" />
          <feMerge>
            <feMergeNode in="bg"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
        <g class="chart" transform="translate({w ? w/2 : 0}, {h ? h/2 : 0})">
        </g>
      </svg>
   </div>

  <ClearFilterButton 
    onClick={() => selected = []} 
    disabled={selected.length === 0} 
  />
</div>


<style lang="scss">
  
</style>