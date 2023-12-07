export default function productPresentation(data, { transform }) {
  return (ctx) => {
    const { circle } = data

    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2*Math.PI)
    ctx.stroke_()
  }
}