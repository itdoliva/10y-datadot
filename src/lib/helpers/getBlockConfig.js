export default function getBlockConfig(nNodes, nodeSize, gap, fw, fh) {
    // Calculate number of rows and columns in order to block preserve aspect ratio from figure
    const aspectRatio = fw / fh
    let rows = Math.ceil(Math.sqrt(nNodes / aspectRatio))
    let columns = Math.ceil(aspectRatio * rows)

    // Make sure all nodes will fit the figure width
    let blockWidth = columns * (nodeSize + gap) - gap
    while ((blockWidth + nodeSize) > fw) {
      // Remove one node column
      columns--

      // Calculate new block width and amount of rows
      blockWidth = columns * (nodeSize + gap) - gap
      rows = Math.ceil(nNodes / columns)
    }

    const blockHeight = rows * (nodeSize + gap) - gap

    const padding = {
      left: (fw - blockWidth)/2,
      top: blockHeight < fh 
        ? (fh - blockHeight)/2 
        : nodeSize
    }

    // Layout Dimensions
    const extentX = [0, fw]
    const extentY = blockHeight < fh 
      ? [0, fh]
      : [0, blockHeight + 2*nodeSize]
    const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])

    // Getters
    const xScale = ({ i }) => {
      const index = Math.floor(i % columns)
      return index * (nodeSize + gap) + nodeSize/2 + padding.left
    }

    const yScale = ({ i }) => {
      const index = Math.floor(i / columns)
      return index * (nodeSize + gap) + nodeSize/2 + padding.top
    }

    return {
      rows,
      columns,
      padding,
      extent,
      xScale,
      yScale
    }
}