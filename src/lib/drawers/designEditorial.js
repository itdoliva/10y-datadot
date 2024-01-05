import * as PIXI from "pixi.js"


// const rect = new PIXI.Graphics()
// rect.beginFill(0xff0000);
// rect.drawRect(0, 0, 20, 20)

// container.addChild(rect)

// const circle = new PIXI.Graphics()
// circle.beginFill(0xffff00);
// circle.drawEllipse(0, 0, 10, 10)

// container.addChild(circle)

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