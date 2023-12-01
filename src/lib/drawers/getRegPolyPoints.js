export default function getRegPolyPoints(cx, cy, size, sides, theta=0) {
  const points = []

  // Circumcircle radius
  const radius = size * .5 / Math.cos(Math.PI/sides)

  const startAngle = Math.PI/sides + theta

  // Calculate the angle between each side of the polygon
  const angle = 2 * Math.PI / sides

  for (let i=0; i<sides; i++) {
    const x = cx + radius * Math.cos(startAngle + (angle * i));
    const y = cy + radius * Math.sin(startAngle + (angle * i));
    points.push([ x, y ])
  }

  return points
}
