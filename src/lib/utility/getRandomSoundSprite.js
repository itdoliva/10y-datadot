import * as PIXI from "pixi.js"

const primaryTints = [
  0x828AFA,
  0xCEFD6C,     
]

const secondaryTints = [
  0x6D9DFC,
  0xFC826D,
  0xFAF982, 
]

const angles = Array.from({ length: 3 }).map((_, i) => (i/3) * 360)

export default function getRandomSoundSprite() {
  const asset = PIXI.Assets.get("soundFX")
  const sprite = new PIXI.AnimatedSprite(asset.animations.tile)

  sprite.anchor.x = .5
  sprite.anchor.y = .5
  sprite.loop = false
  sprite.zIndex = 10
  sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

  sprite.angle = angles[Math.floor(Math.random() * angles.length)]
  sprite.tint = Math.random() < .66
    ? primaryTints[Math.floor(Math.random() * primaryTints.length)]
    : secondaryTints[Math.floor(Math.random() * secondaryTints.length)]

  return sprite
}