import randomDensity from "$lib/utility/randomDensity"
import layoutConfig from "$lib/config/layout"

const { 
  fullColEntranceDuration,
  colEntranceUpTo
} = layoutConfig

export default function getPosBlock(nodes, settings, dimensions, update) {
  //activeCount, nodeSize, gap, fw, fh, config, prevConfig, updateConfig, updateZoomExtent) {
  console.log('getPosBlock', {nodes, settings, dimensions, update})
  const { rows, columns, padding, extent, maxRowsOnView, blockHeight } = getBlockConfig(nodes, dimensions)
  
  // The calculation below support block entrance animation
  const columnDensities = randomDensity(columns)
  const timeStepByRow = +(fullColEntranceDuration / maxRowsOnView).toFixed(4)
  
  settings.config.set({ rows, columns, columnDensities, timeStepByRow } )
  update.zoomExtent(extent)

  const getDelay = (data, prev=false) => {
    if (!data) return 0

    const { row, column } = data

    const delayConfig = prev 
      ? settings.config.prev 
      : settings.config.cur

    const columnDelay = delayConfig.columnDensities[column] * colEntranceUpTo
    const rowDelay = delayConfig.timeStepByRow * row

    return +(columnDelay + rowDelay).toFixed(3)
  }

  const { nodeSize, gap, fw, fh } = dimensions
  return ({ i }) => {
    // Calculate the node row and column indices for the given i
    const column = Math.floor(i % columns)
    const row = Math.floor(i / columns)

    const fx = column * (nodeSize + gap) + nodeSize/2 - fw/2 + padding.left
    const fy = row * (nodeSize + gap) + nodeSize/2 - fh/2 + padding.top

    const delay = getDelay({ row, column })

    return { fx, fy, data: { row, column, delay, getDelay } }
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


  return {
    rows,
    columns,
    padding,
    extent,
    blockWidth,
    blockHeight,
    maxRowsOnView,
  }
}