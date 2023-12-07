export default function designEditorial(data, { transform }) {
  const { shapes } = data
  return (ctx) => {
    for (let shape of shapes) {
      ctx.beginPath()
      ctx.linkEdges(transform(shape))
      ctx.stroke_()
    }
  }
}