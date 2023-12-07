export default function designIllustration(data, { transform }) {
  return (ctx) => {
    const { lines } = data

    for (let line of lines) {
      ctx.beginPath()
      ctx.linkEdges(transform(line), false)
      ctx.stroke_()
    }
  }
}