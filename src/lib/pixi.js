import * as PIXI from "pixi.js"
import { settings } from 'pixi.js';
import BackgroundVertex from "$lib/bg.vert?raw";
import BackgroundFragment from "$lib/bg.frag?raw";


settings.RESOLUTION = window.devicePixelRatio;

export default function initPixi(view) {
  const app = globalThis.__PIXI_APP__ = new PIXI.Application({ 
    roundPixels: true,
    view, 
    resizeTo: window, 
    backgroundColor: 0xFFFFFF
  })

  addAssets()
  initMesh(app)

  return app
}

function addAssets() {
  PIXI.Assets.add({ alias: 'petal', src: '/sprites/petal.png' })
  PIXI.Assets.add({ alias: 'cursor', src: '/sprites/cursor.png' })
}


function initMesh(app) {
  const bgFilter = new PIXI.Filter(BackgroundVertex, BackgroundFragment, {
    iTime: 0.0,
    iRatio: 1.0,
  })

  const meshGradient = new PIXI.Graphics()
  meshGradient.filters = [ bgFilter ]

  app.stage.addChild(meshGradient)

  app.ticker.add((delta) => {
    bgFilter.uniforms.iTime += .025 * delta;
    bgFilter.uniforms.iRatio = app.screen.width / app.screen.height;

    meshGradient.clear()
    meshGradient.beginFill(0xFFFFFF)
    meshGradient.drawRect(0, 0, app.screen.width, app.screen.height)
    meshGradient.endFill()
  });
}