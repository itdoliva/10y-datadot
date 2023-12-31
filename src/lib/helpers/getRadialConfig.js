import * as d3 from "d3"

function getDomain(groupBy) {
  return groupBy === 'year'
    ? d3.range(2014, 2024, 1)
    : [ 0, 1 ]
}

export default function getRadialConfig(nodes, nNodes, nodeSize, gap, groupBy, innerRadius, maxStacksK, fw, fh) {
  const padding = { left: fw/2, top: fh/2 }

  const groupAcc = d => d[groupBy]
  const grouped = d3.group(nodes, groupAcc)
  grouped.groupAcc = groupAcc

  const maxStacks = grouped.size // Math.round(nNodes * maxStacksK / grouped.size)

  const size = 2*(innerRadius + maxStacks * (nodeSize + gap))
  const exceedX = size - fw
  const exceedY = size - fh
  const extentX = exceedX > 0 ? [-exceedX/2, fw+exceedX/2] : [0, fw]
  const extentY = exceedY > 0 ? [-exceedY/2, fh+exceedY/2] : [0, fh]
  const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])


  // Count Number of Piles each category will have
  grouped.forEach((v) => v.nPiles = Math.ceil(v.length/maxStacks))

  const innerPad = grouped.size > 1 ? .15 : 0
  const sectorRadiansScale = d3.scaleBand()
    .domain([...grouped.keys()])
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

  // const radiansScale = (node) => {
  //   const catValue = node[sortBy]
  //   const catNodes = grouped.get(catValue)
  //   const nodeIndex = catNodes.findIndex(d => d.id === node.id)
  //   const barIndex = Math.floor(nodeIndex / maxStacks)
  //   const pileOffset = catNodes.diffPiles * pileRadiansScale.bandwidth() /2

  //   const radians = sectorRadiansScale(catValue) + pileRadiansScale(barIndex) + pileOffset
  //   return radians
  // }
}