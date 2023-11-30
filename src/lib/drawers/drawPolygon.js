export default function drawPolygon(ctx, centerX, centerY, sides, radius, startAngle = 0) {
  // Calculate the angle between each side of the polygon
  const angle = 2 * Math.PI / sides;

  // Move to the initial point on the circumference
  const startX = centerX + radius * Math.cos(startAngle);
  const startY = centerY + radius * Math.sin(startAngle);

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  for (let i = 1; i <= sides; i++) {
    const x = centerX + radius * Math.cos(startAngle + angle * i);
    const y = centerY + radius * Math.sin(startAngle + angle * i);
    ctx.lineTo(x, y);
  }

  ctx.closePath();
}
