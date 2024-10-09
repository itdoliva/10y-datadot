import { get } from "svelte/store"
import { figureWidth, figureHeight, nodeSize, gap } from "../stores"
import { calculateAspectRatio, randomDensity } from "../utils/helpers"
import { LAYOUT_PARAMS } from "../utils/constants"

export abstract class Layout {
  abstract applyLayout(nodes: Deliverable[], {}: any): void
}

export class BlockLayout extends Layout {

  public applyLayout(nodes: Deliverable[], { nActive }): void {
    const sNodeSize = get(nodeSize)
    const sGap = get(gap)
    const sFw = get(figureWidth)
    const sFh = get(figureHeight)

    const { rows, columns, blockWidth, blockHeight } = this.calculateRowsAndColumns(nActive, sNodeSize, sGap, sFw, sFh)

    const colDensities = randomDensity(columns)
    const rowInterval = Math.round(100*LAYOUT_PARAMS.blockMaxEntryDuration / rows) / 100 // keeps 2 decimal places

    nodes.forEach(node => {
      const attr = { x: 0, y: 0, radius: 0, theta: 0, time: 0, active: node.active }

      if (node.active) {
        const colIndex = Math.floor(node.i % columns)
        const rowIndex = Math.floor(node.i / columns)
 
        attr.x = colIndex * (sNodeSize + sGap) + sNodeSize/2 - blockWidth/2
        attr.y = rowIndex * (sNodeSize + sGap) + sNodeSize/2 - blockHeight/2
        attr.time = 
        colDensities[colIndex] * LAYOUT_PARAMS.blockMaxEntryDelay + // column delay
        rowInterval * rowIndex // row delay
      }
    })
  }

  private calculateRowsAndColumns(
    nActive: number,
    nodeSize: number,
    gap: number,
    fw: number,
    fh: number
  ) {
    const aspectRatio = calculateAspectRatio(fw, fh)
  
    // Calculate initial number of rows and columns based on aspect ratio
    const initRows = Math.ceil(Math.sqrt(nActive / aspectRatio))
    const initColumns = Math.ceil(aspectRatio * initRows)

    // Adjust rows to ensure all nodes fit within the figure width
    let rows = Math.ceil(nActive / initColumns)
    let columns = initColumns

    // Calculate initial block width and height
    let blockWidth = (columns + 1) * (nodeSize + gap) - gap
    let blockHeight;

    // Reduce the number of columns until all nodes fit within the figure width
    while (blockWidth > fw) {
      // Remove one node column and Recalculate block width
      blockWidth = --columns * (nodeSize + gap) - gap

      // Recalculate rows to fit the reduced number of columns
      rows = Math.ceil(nActive / columns)
    }

    // Once we have a block that fits the figureWidth, 
    // we remove another column to make margin
    blockWidth = --columns * (nodeSize + gap) - gap
    rows = Math.ceil(nActive / columns)

    // Update block height
    blockHeight = rows * (nodeSize + gap) - gap

    return { rows, columns, blockWidth, blockHeight }
  };



}

export class RadialLayout extends Layout {
  applyLayout(nodes: Deliverable[]): void {
    // Apply radial layout
  }
}

export default class LayoutManager {
  private layout: Layout

  setLayout(layout: Layout) {
    this.layout = layout
  }

  applyLayout(nodes: Deliverable[]) {
    if (!this.layout) return

    this.layout.applyLayout(nodes)
  }
}