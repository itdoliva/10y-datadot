import * as d3 from "d3"

const c = {}

c.maxStacksK = .25
c.innerRadius = 180

c.shifts = 1

// Do not edit
c.shiftms = c.shiftms * 1000

c.maxDelayRadial = .7 * c.shifts
c.maxDurationRadial = (c.shifts - c.maxDelayRadial)


c.easeFade = d3.easeCubicInOut
c.easeExit = d3.easeSinIn


// const interpolateConstant = (a, b) => () => b
// const defaultOptions = { 
  // duration: 1, 
  // interpolate: interpolateConstant 
// }

  // const originAlpha = tweened(1, defaultOptions)
  // const originScale = tweened(1, defaultOptions)
  // const originX = tweened(0, defaultOptions)
  // const originY = tweened(0, defaultOptions)
  // const originRotation = tweened(0, defaultOptions)
  // const originRenderable = tweened(true, { interpolate: interpolateConstant })

  // const containerX = tweened(0, defaultOptions)
  // const containerY = tweened(0, defaultOptions)


export default c