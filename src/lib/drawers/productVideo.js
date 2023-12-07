export default function productVideo(data, { transform }) {
  const { triangle, circle } = data
  
  return (ctx) => {

    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2 * Math.PI)
    ctx.stroke_()

    ctx.beginPath()
    ctx.linkEdges(transform(triangle))
    ctx.fill_()
  }
}