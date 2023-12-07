export default function productPublication(data, { transform }) {
  return (ctx) => {
    const { shapes } = data

    ctx.beginPath()
    ctx.linkEdges(transform(shapes[0]))
    ctx.fill_()
    ctx.stroke_()
    
    ctx.beginPath()
    ctx.linkEdges(transform(shapes[1]))
    ctx.stroke()
  }
}
