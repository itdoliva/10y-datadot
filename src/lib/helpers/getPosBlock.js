import randomDensity from "$lib/utility/randomDensity"
import layoutConfig from "$lib/config/layout"

const { 
  fullColEntranceDuration,
  colEntranceUpTo,
  easeDelay
} = layoutConfig

export default function getPosBlock(nodes, dimensions, update) {
  console.log((+(new Date())/1000).toFixed(3), 'getPosBlock', `nNodes: ${nodes.length} (${100*nodes.activeCount/nodes.length}%)\t viewport: ${dimensions.fw}, ${dimensions.fh}`)

  const config = getBlockConfig(nodes, dimensions)
  const { rows, columns, padding, extent, columnDensities, timeStepByRow } = config

  update.zoomExtent(extent)

  const { nodeSize, gap, fw, fh } = dimensions

  return function ({ i }) {
    // Calculate the node row and column indices for the given i
    const column = Math.floor(i % columns)
    const row = Math.floor(i / columns)

    const x = column * (nodeSize + gap) + nodeSize/2 - fw/2 + padding.left
    const y = row * (nodeSize + gap) + nodeSize/2 - fh/2 + padding.top

    // Calculate delay
    const columnDelay = columnDensities[column] * colEntranceUpTo
    const rowDelay = timeStepByRow * row
    const delay = columnDelay + rowDelay

    return { x, y, theta: 0, radius: 0, delay, config }
  }
}


function getBlockConfig({ activeCount }, { nodeSize, gap, fw, fh }) {
  // Calculate number of rows and columns in order to block preserve aspect ratio from figure
  const aspectRatio = fw / fh
  let rows = Math.ceil(Math.sqrt(activeCount / aspectRatio))
  let columns = Math.ceil(aspectRatio * rows)
  rows = Math.ceil(activeCount / columns)

  // Make sure all nodes will fit the figure width
  let blockWidth = columns * (nodeSize + gap) - gap + nodeSize
  while ((blockWidth + nodeSize) > fw) {
    // Remove one node column
    columns -= 1

    // Calculate new block width and amount of rows
    blockWidth = columns * (nodeSize + gap) - gap + nodeSize 
    rows = Math.ceil(activeCount / columns)
  }


  const blockHeight = rows * (nodeSize + gap) - gap

  const padding = {
    left: (fw - blockWidth)/2 + nodeSize/2,
    top: blockHeight < fh 
      ? (fh - blockHeight)/2 
      : nodeSize
  }

  const maxRowsOnView = Math.min(rows, Math.ceil((fh - padding.top) / (nodeSize + gap)))

  // Layout Dimensions
  const extentX = [0, fw]
  const extentY = blockHeight < fh 
    ? [0, fh]
    : [0, blockHeight + 2*nodeSize]
  const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])


  // The calculation below support block entrance animation
  const columnDensities = randomDensity(columns)
  const timeStepByRow = +(fullColEntranceDuration / maxRowsOnView).toFixed(4)


  return {
    layout: "block",
    rows,
    columns,
    padding,
    extent,
    blockWidth,
    blockHeight,
    maxRowsOnView,
    columnDensities,
    timeStepByRow
  }
}