export default function productInfographic(data, { transform, rotation, makeChannel }) {
  const { shapes } = data

  return (ctx) => {
    ctx.save()
    makeChannel(ctx)
    ctx.clip()

    ctx.beginPath()
    ctx.linkEdges(transform(shapes[0]))
    ctx.stroke_()

    ctx.beginPath()
    ctx.linkEdges(transform(shapes[1]))
    ctx.fill_()

    ctx.restore()

  }
}








