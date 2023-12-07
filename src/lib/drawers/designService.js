export default function designService(data, { transform }) {
  return (ctx) => {
    const { lines, circle } = data

    for (let line of lines) {
      ctx.beginPath()
      ctx.linkEdges(transform(line), false)
      ctx.stroke_()
    }

    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2*Math.PI)
    ctx.stroke_()
  }
}
