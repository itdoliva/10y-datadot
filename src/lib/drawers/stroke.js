export default function stroke(ctx, stroke, width=1) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.stroke()
}