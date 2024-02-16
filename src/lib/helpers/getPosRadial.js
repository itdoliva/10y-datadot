import * as d3 from "d3";
import layoutConfig from "$lib/config/layout"

const { 
  maxStacksK, 
  innerRadius, 
  maxDelayRadial, 
  rotationOffset
} = layoutConfig

export default function getPosRadial(nodes, groupBy, settings, dimensions, update) {
  console.log('\tgetPos radial')

  const {
    extent,
    grouped,
    sectorRadiansScale,
    pileRadiansScale,
    maxStacks
  } = getRadialConfig(nodes, groupBy, dimensions)

  settings.config.set({ grouped, sectorRadiansScale, pileRadiansScale, innerRadius, maxStacks })
  update.zoomExtent(extent)

  const delayScale = d3.scaleLinear()
    .domain([0, 2*Math.PI])
    .range([0, maxDelayRadial])

  const getDelay = ({ radians }) => delayScale(radians)

  return (node) => {
    // Get category of sector
    const catValue = node[groupBy]

    // Get occurrence of this node in the group of nodes with the same catValue
    const catNodes = grouped.get(catValue)
    const nodeIndex = catNodes.findIndex(d => d.id === node.id)
    const pileIndex = Math.floor(nodeIndex / maxStacks)
    const stackIndex = nodeIndex % maxStacks

    const radiansOffset = catNodes.diffPiles * pileRadiansScale.bandwidth()/2
    const radians = sectorRadiansScale(catValue) + pileRadiansScale(pileIndex) + radiansOffset

    const radius = innerRadius + stackIndex * (dimensions.nodeSize + dimensions.gap)

    const rotation = radians + rotationOffset

    const delay = getDelay({ radians })

    return { fx: 0, fy: radius, rotation, data: { radius, radians, rotation, delay, getDelay } }
  }
}


function getRadialConfig(nodes, groupBy, dimensions) {

  const groupAcc = d => d[groupBy]
  const grouped = d3.group(nodes, groupAcc)
  grouped.groupAcc = groupAcc

  const activeGrouped = d3.group(nodes.filter(d => d.active), groupAcc)

  const maxStacks = Math.min(10, Math.round(nodes.activeCount * maxStacksK / activeGrouped.size)) //grouped.size // 

  const { nodeSize, gap, fw, fh } = dimensions
  
  const padding = { left: fw/2, top: fh/2 }

  const size = 2*(innerRadius + maxStacks * (nodeSize + gap))
  const exceedX = size - fw
  const exceedY = size - fh
  const extentX = exceedX > 0 ? [-exceedX/2, fw+exceedX/2] : [0, fw]
  const extentY = exceedY > 0 ? [-exceedY/2, fh+exceedY/2] : [0, fh]
  const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])

  // Count Number of Piles each category will have
  grouped.forEach((v) => v.nPiles = Math.ceil(v.length/maxStacks))

  const sectorValues = [...activeGrouped.keys()]
  const innerPad = sectorValues.length > 1 ? .15 : 0
  const sectorRadiansScale = d3.scaleBand()
    .domain(sectorValues)
    .range([ 0, 2*Math.PI ])
    .paddingInner(innerPad)
    .paddingOuter(innerPad/2)

  const totalPiles = ~~d3.max([...grouped.values()], d => d.nPiles)
  const pileRadiansScale = d3.scaleBand()
    .domain(d3.range(0, totalPiles, 1))
    .range([0, sectorRadiansScale.bandwidth()])

  grouped.forEach((v) => v.diffPiles = totalPiles - v.nPiles)

  return {
    padding,
    extent,
    grouped,
    sectorRadiansScale,
    pileRadiansScale,
    maxStacks
  }

}