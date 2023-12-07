export default function productReport(data, { transform }) {
  return (ctx) => {
    const { square } = data

    ctx.beginPath()
    ctx.linkEdges(transform(square))
    ctx.fill_()
  }
}