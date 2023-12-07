export default function goal(data, { transform, getFillStyle }) {
  return (ctx) => {
    ctx.beginPath()

    for (let i=0; i<data.length; i++) {
      const cur = data[i]
      const next = data[(i+1)%data.length]

      const bezierParams = transform([
        ...cur.slice(2, 4),
        ...next.slice(4, 6),
        ...next.slice(0, 2)
      ])

      ctx.bezierCurveTo(...bezierParams)
    }

    ctx.fill_(getFillStyle())
  }
}

    // for (let id of node.goals) {
    //   const goalPoints = $goals[id].map(translate)

    //   ctx.beginPath()
    //   for (let i=0; i<goalPoints.length; i++) {
    //     const cur = goalPoints[i]
    //     const next = goalPoints[(i+1)%(goalPoints.length)]

    //     const bezierParams = rotate([
    //       ...cur.slice(2, 4), 
    //       ...next.slice(4, 6),
    //       ...next.slice(0, 2)
    //     ])

    //     ctx.bezierCurveTo(...bezierParams)
    //   }

    //   ctx.fillStyle = $categories.goals.find(d => d.id === id).color
    //   ctx.fill()
    // }