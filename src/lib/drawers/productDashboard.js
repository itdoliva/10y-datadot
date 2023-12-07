export default function productDashboard(data, { transform, makeChannel }) {
  const { circles } = data

  return (ctx) => {
  const [ px, py ] = transform(circles[0].pos)

    ctx.save()
    makeChannel(ctx)
    ctx.clip()
    
    ctx.beginPath()
    ctx.arc(px, py, circles[0].radius, 0, 2*Math.PI)
    ctx.stroke_()
    
    ctx.beginPath()
    ctx.arc(px, py, circles[1].radius, 0, 2*Math.PI)
    ctx.fill_()
    
    ctx.restore()
  }
}





