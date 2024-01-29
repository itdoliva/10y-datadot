export default function getBlockConfig(activeCount, nodeSize, gap, fw, fh) {
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