export default function designMotion(data, { transform }) {
  return (ctx) => {
    const { line, circle } = data

    ctx.beginPath()
    ctx.linkEdges(transform(line), false)
    ctx.stroke_()
    
    ctx.beginPath()
    ctx.arc(...transform(circle.pos), circle.radius, 0, 2*Math.PI)
    ctx.fill_('white')
    ctx.stroke_()
  }
}