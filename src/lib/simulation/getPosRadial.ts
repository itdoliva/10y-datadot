// Libraries
import * as d3 from "d3";

// Files
import layoutConfig from "../config/layout"

// Types
import { Node, Nodes } from "../types/node"
import { SectorDataPoint, SectorMetadata, SectorData, Dimensions, LayoutConfig } from "./interfaces";

const { 
  maxDelayRadial, 
} = layoutConfig


export default function getPosRadial(nodes: Nodes, groupBy: string, dimensions: Dimensions): [ SectorData, LayoutConfig ] {
  const { nodeSize, fw, fh } = dimensions

  const [ posDataset, innerRadius ] = getOptimalPositionDataset(nodes, groupBy, dimensions)
  
  // Calculate Extents
  const padding = { left: fw/2, top: fh/2 }

  // Check if layout dimensions are exceeding the figure dimensions
  const radialWidth  = d3.max(posDataset, d => d.x) - d3.min(posDataset, d => d.x)
  const radialHeight = d3.max(posDataset, d => d.y) - d3.min(posDataset, d => d.y)
  const exceedX = radialWidth - fw
  const exceedY = radialHeight - fh

  // Calculate extent
  const extentX = exceedX > 0 ? [-(exceedX/2 + nodeSize*3), fw + (exceedX/2 + nodeSize*3)] : [ 0, fw ]
  const extentY = exceedY > 0 ? [-(exceedY/2 + nodeSize*3), fh + (exceedY/2 + nodeSize*3)] : [ 0, fh ]
  const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])

  const config: LayoutConfig = {
    data: { innerRadius },
    padding,
    extent
  }

  return [ posDataset, config ]

}


function getOptimalPositionDataset(nodes: Nodes, groupBy: string, { nodeSize, fw, fh }): [SectorData, number] {
  const gap = nodeSize*1.25

  const data = nodes.filter(d => d.active)

  const minRadius = Math.min(fw, fh) * .05
  const maxPileStack = nodes.activeCount**(1/3)

  let curData
  let curMetadata
  let curRadius = minRadius

  let isFitting = true

  // As long as the circle length for the current radius is less than the needed
  // length to carry, increases the current radius by each iteration
  do {
    const circleLength = 2 * Math.PI * curRadius

    // For each iteration, test
    const pileStacks = d3.range(1, maxPileStack + 1, 1)
    pileStacks.forEach((pileStack: number) => {
      const sectorData = makeSectorData(data, groupBy, pileStack)
      curData = sectorData[0]
      curMetadata = sectorData[1]

      const layoutCircleLength = (curMetadata.nPiles + curMetadata.nGaps) * gap

      isFitting = circleLength < layoutCircleLength
    })

    curRadius += gap
    
  } while (isFitting) 


  // Make Position Dataset from Optimal Sector Dataset
  const thetaScale = d3.scaleLinear()
    .domain([ 0, curMetadata.nPiles + curMetadata.nGaps ])
    .range([ 0, 2*Math.PI ])

  const timeScale = d3.scaleLinear()
    .domain([ 0, 2*Math.PI ])
    .range([ 0, maxDelayRadial ])

  const positionDataset = curData.map(d => {
    const theta = thetaScale(d.pileIndex + d.sectorIndex)
    const radius = curRadius + d.inPileIndex * (gap + nodeSize)

    return {
      id: d.id,
      x: Math.cos(theta) * radius,
      y: Math.sin(theta) * radius,
      theta,
      radius,
      time: timeScale(theta)
    }
  })


  return [ positionDataset, curRadius ]
}


function makeSectorData(data: Node[], groupBy: string, maxPileStack: number): [SectorData, SectorMetadata] {
  const acc = (d: Node) => d[groupBy]

  // Sorted unique values for the provided groupBy variable
  const unique = Array.from(new Set(data.map(acc))).sort(d3.ascending)

  // Create the sector dataset by computing a sectorIndex, pileIndex and inPileIndex for each dataPoint in data
  let lastSectorIndex = 0
  let pileIndex = 0
  let inPileIndex = 0
  
  const sectorData: any = []
  data.sort((a, b) => d3.ascending(acc(a), acc(b))).forEach((dataPoint) => {
    const sectorIndex = unique.indexOf(acc(dataPoint))
    
    // If the current sector is different from the previous one or
    // the current pile has already reached the maximum number of stacks
    if (lastSectorIndex !== sectorIndex || inPileIndex === maxPileStack) {
      pileIndex += 1
      inPileIndex = 0
    }

    sectorData.push({
      id: dataPoint.id,
      sectorIndex,
      pileIndex,
      inPileIndex
    })

    inPileIndex++
    lastSectorIndex = sectorIndex
  })

  // Compute the sectorDataset's partial metadata
  const nSectors = unique.length
  const nGaps = nSectors === 1 ? 0 : (nSectors + 1)
  const nPiles = d3.max(sectorData, (d: SectorDataPoint) => d.pileIndex)

  const metadata: SectorMetadata = { nGaps, nPiles }

  return [ sectorData, metadata ]
}