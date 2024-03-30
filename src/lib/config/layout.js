import * as d3 from "d3"

const c = {}

c.shifts = 1

c.maxDelayRadial = .7 * c.shifts

c.easeDelay = d3.easeCubicInOut
c.easeEntrance = d3.easeCubicInOut
c.easeFade = d3.easeCubicInOut
c.easeExit = d3.easeSinIn

c.colEntranceUpTo = c.shifts * .2
c.fullColEntranceMaxDuration = c.shifts - c.colEntranceUpTo

// Filter Transitions
c.filterTotalDuration = c.shifts
c.filterBetweenGap = c.filterTotalDuration * .15
c.filterDuration = c.filterTotalDuration - c.filterBetweenGap
c.filterHalf1 = c.filterDuration * .4
c.filterHalf2 = c.filterDuration * .6

// Do not edit
c.maxDurationRadial = (c.shifts - c.maxDelayRadial)


export default c