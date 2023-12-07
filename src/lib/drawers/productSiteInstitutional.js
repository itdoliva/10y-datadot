export default function productSiteInstitutional(data, { transform }) {
  const { triangle, square } = data
  return (ctx) => {
    ctx.beginPath()
    ctx.linkEdges(transform(square))
    ctx.stroke_()

    ctx.beginPath()
    ctx.linkEdges(transform(triangle))
    ctx.fill_()
  }
}
