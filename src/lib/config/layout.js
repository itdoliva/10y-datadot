import * as d3 from "d3"

const c = {}

c.maxStacksK = .25
c.innerRadius = 180

c.shifts = 1

c.maxDelayRadial = .7 * c.shifts

c.easeDelay = d3.easeCubicInOut
c.easeEntrance = d3.easeCubicInOut
c.easeFade = d3.easeCubicInOut
c.easeExit = d3.easeSinIn

c.colEntranceUpTo = c.shifts * .2
c.fullColEntranceDuration = c.shifts - c.colEntranceUpTo
c.rotationOffset = -Math.PI/2

// Do not edit
c.shiftms = c.shiftms * 1000
c.maxDurationRadial = (c.shifts - c.maxDelayRadial)


export default c