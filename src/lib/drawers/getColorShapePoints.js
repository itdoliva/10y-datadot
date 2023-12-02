export default function getColorShapePoints(x, y, h, i) {
  const w = .75*h

  const angle = i * (2*Math.PI/5)
  
  const points = [
    { p: [x, y], a1: [x + w*.25, y], a2: [x - w*.25, y] },
    { p: [x + w*.5, y - h*.25], a1: [x + w*.5, y - h*.375], a2: [x + w*.5, y - h*.125] },
    { p: [x, y - h], a1: [x - w*.5, y - h], a2: [x + w*.5, y - h] },
    { p: [x - w*.5, y - h*.25], a1: [x - w*.5, y - h*.125], a2: [x - w*.5, y-h*.375] },
  ]

  return { points, angle }
}