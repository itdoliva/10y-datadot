import * as d3 from 'd3'


export default function getScale(s, isBlock, sortBy) {
  return s === 'x'
    ? getXScale(isBlock, sortBy)
    : null
}


function getXScale(isBlock, sortBy) {
  if (isBlock) {
    return d => d
  }

  const domain = sortBy === 'year'
    ? d3.range(2014, 2024, 1)
    : [ 0, 1 ]

  return d3.scaleBand()
    .domain(domain)
    .range([ 0, 2*Math.PI ])
    .paddingInner(.2)
    .paddingOuter(.1)
}