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

    return {
      rows,
      columns,
      blockWidth,
      blockHeight
    }
}