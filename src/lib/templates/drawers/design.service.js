import * as PIXI from "pixi.js"


export default function serviceTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  const hline = [ -nodeSize*.8, nodeSize*.33, nodeSize*.86, nodeSize*.33 ]
  const dline = [ -nodeSize*.48, nodeSize*.85, nodeSize*.87, -nodeSize*.5 ]

  const lines = [ hline, dline ]


  template.lineStyle(lineWidth, 0x000000)

  lines.forEach(linePoints => {
    for (let i=0; i<linePoints.length; i+=2) {
      const points = linePoints.slice(i, i+2)
      if (i === 0) {
        template.moveTo(...points)
      } else {
        template.lineTo(...points)
      }
    }
    template.endFill()
  })

  template.drawCircle(nodeSize*.15, 0, nodeSize*.5)
  template.endFill()

  return template
}
