import { derived, writable } from "svelte/store";

export const width = writable(100)
export const height = writable(100)
export const pixelRatio = writable(1);

export const nodes = writable([])
export const nNodes = derived(nodes, $nodes => $nodes.length);

export const gap = derived(pixelRatio, ($pixelRatio) => {
  return 18 * $pixelRatio
});

export const nodeSize = derived(([ width, pixelRatio ]), ([ $width, $pixelRatio ]) => {
  // Mobile
  if ($width <= 768) {
    return 60 * $pixelRatio
  }

  // Desktops
  else if ($width <= 1800) {
    return 20 * $pixelRatio
  }
  // Large Desktops
  return 25 * $pixelRatio
});


export const plotWidth = derived([width, nodeSize, gap, nNodes, pixelRatio], ([$width, $nodeSize, $gap, $nNodes, $pixelRatio]) => {
  if ($width <= 768) {
    const maxWidth = ($width - 20 * 2) * $pixelRatio
    const nodesPerRow = Math.floor(maxWidth / ($nodeSize + $gap))
    return nodesPerRow * ($nodeSize + $gap) - $gap
  }
  const nodesPerRow = Math.floor(Math.sqrt($nNodes))
  return nodesPerRow * ($nodeSize + $gap) - $gap
});


export const plotHeight = derived([plotWidth, nodeSize, gap, nNodes], ([$plotWidth, $nodeSize, $gap, $nNodes]) => {
  const nodesPerRow = Math.floor(($plotWidth + $gap) / ($nodeSize + $gap))
  const nRows = Math.ceil($nNodes / nodesPerRow)
  return nRows * ($nodeSize + $gap) - $gap
});


export const padding = derived([width, height, plotWidth, plotHeight, pixelRatio], ([$width, $height, $plotWidth, $plotHeight, $pixelRatio]) => {
  const left = ($width * $pixelRatio - $plotWidth) / 2

  if ($width <= 768) {
    return { top: 20*$pixelRatio, left }
  }

  const top = ($height * $pixelRatio - $plotHeight) / 2
  return { top, left }
})

