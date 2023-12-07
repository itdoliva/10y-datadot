export default function productSiteEditorial(data, { transform, getRotation }) {
  const { circle } = data

  return (ctx) => {
    const theta = getRotation()
    const t0 = theta - Math.PI/4
    const t1 = theta + Math.PI/2 + Math.PI/4

    ctx.beginPath()
    ctx.arc(...transform([0, 0]), circle.radius, t0, t1)
    ctx.fill_()
    
    ctx.beginPath()
    ctx.arc(...transform([0, 0]), circle.radius, 0, 2*Math.PI)
    ctx.stroke_()
  }
}
