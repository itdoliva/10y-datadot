// Libraries
import * as d3 from "d3";

// Files
import layoutConfig from "../config/layout"

// Types
import { Node, Nodes } from "../types/node"
import { SectorDataPoint, SectorMetadata, SectorData, Dimensions, LayoutConfig } from "./interfaces";


export default function makeSectorData(data: Node[], groupBy: string, maxStack: number): [ SectorData, SectorMetadata ] {
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
    if (lastSectorIndex !== sectorIndex || inPileIndex === maxStack) {
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
  
    const metadata: SectorMetadata = { 
      nGaps, 
      nPiles 
    }

    return [ sectorData, metadata ]
}