import randomDensity from "$lib/utility/randomDensity"
import layoutConfig from "$lib/config/layout"

const { 
  fullColEntranceMaxDuration,
  colEntranceUpTo,
} = layoutConfig

export default function getPosBlock(nodes, dimensions) {
  const config = computeConfig(nodes.activeCount, dimensions)
  const posDataset = makePositionDataset(nodes.filter(d => d.active), dimensions, config)

  return [ posDataset, config ]
}

function makePositionDataset(nodes, { fw, fh, nodeSize, gap }, { rows, columns, padding }) {
  // The calculation below support block entrance animation
  const columnDensities = randomDensity(columns)
  const timeStepByRow = +(fullColEntranceMaxDuration / rows).toFixed(4)

  const getTime = (colIndex, rowIndex) => (
    columnDensities[colIndex] * colEntranceUpTo + // column delay
    timeStepByRow * rowIndex // row delay
  )

  const xOffset = nodeSize/2 - fw/2 + padding.left
  const yOffset = nodeSize/2 - fh/2 + padding.top

  return nodes.map(({ id, i }) => {
    const colIndex = Math.floor(i % columns)
    const rowIndex = Math.floor(i / columns)
  
    return {
      id,
      x: colIndex * (nodeSize + gap) + xOffset,
      y: rowIndex * (nodeSize + gap) + yOffset,
      theta: 0,
      radius: 0,
      time: getTime(colIndex, rowIndex),
    }
  })
}

function computeConfig(nActiveNodes, { nodeSize, gap, fw, fh }) {
  const aspectRatio = fw / fh

  let rows = Math.ceil(Math.sqrt(nActiveNodes / aspectRatio))
  let columns = Math.ceil(aspectRatio * rows)

  rows = Math.ceil(nActiveNodes / columns)

  // Make sure all nodes will fit the figure width
  let blockWidth = (columns + 1) * (nodeSize + gap)
  while (blockWidth > fw) {
    // Remove one node column
    columns -= 1

    // Calculate new block width and amount of rows
    blockWidth = columns * (nodeSize + gap) - gap + nodeSize 
    rows = Math.ceil(nActiveNodes / columns)
  }

  const blockHeight = rows * (nodeSize + gap) - gap

  // Compute padding
  const padding = {
    left: (fw - blockWidth)/2 + nodeSize/2,
    top: blockHeight < fh  ? (fh - blockHeight)/2 : nodeSize
  }

  // Compute Extents
  const extentX = [0, fw]
  const extentY = blockHeight >= fh ? [0, blockHeight + 2*nodeSize] : [0, fh]
  const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])

  return {
    rows,
    columns,
    padding,
    extent,
  }
}