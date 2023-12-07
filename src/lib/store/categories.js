import { writable, derived } from "svelte/store";
import * as d3 from 'd3'
import { nodeSize, colorHeight } from "$lib/store/canvas"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints";
import rotateAroundPoint from "$lib/helpers/rotateAroundPoint";

export const categories = writable({})

export const props = derived(nodeSize, $nodeSize => {
  return d3.range(0, 1.01, .01).map(d => $nodeSize*d)
})


// DESIGNS
export const illustration = derived(props, $p => {

  // Calculate edges
  const top = [0, -$p[98]]
  const left = [-$p[84], $p[84]]
  const right = [$p[84], $p[84]]
  const bottom = [0, $p[100]]

  // Calculate shapes
  const lines = [top, left, right, bottom].map(edge => [[0, 0], edge])

  return { lines }
})


export const editorial = derived(props, $p => {
  // Triangle
  const triangle = [
    [0, 0],
    [-$p[33], -$p[83]],
    [$p[33], -$p[83]],
  ]

  // Square
  const square = [
    [-$p[33], $p[50]],
    [$p[33], $p[50]],
    [$p[33], $p[66]],
    [-$p[33], $p[66]],
  ]

  const shapes = [triangle, square]

  return { shapes }
})


export const service = derived(props, $p => {

  // Horizontal line
  const hline = [
    [-$p[80], $p[33]],
    [$p[86], $p[33]],
  ]
  
  // Diagonal line
  const dline = [
    [-$p[48], $p[85]],
    [$p[87], -$p[50]]
  ]

  const lines = [hline, dline]

  // Circle center
  const cpos = [$p[15], 0]
  const crad = $p[50]

  return { lines, circle: { pos: cpos, radius: crad }}
})


export const ui = derived(props, $p => {
  // Upper line
  const uline = [
    [-$p[83], -$p[50]],
    [$p[50], $p[83]],
  ]

  // Lower line
  const lline = [
    [-$p[83], -$p[17]],
    [$p[17], $p[83]]
  ]

  const lines = [ uline, lline ]

  return { lines }
})


export const motion = derived(props, $p => {
  // Line
  const line = [
    [-$p[17], $p[83]],
    [$p[83], -$p[17]],
  ]

  // Circle
  const cpos = [$p[33], $p[33]]
  const crad = $p[33]/2

  return { line, circle: { pos: cpos, radius: crad } }
})


export const designs = derived([illustration, editorial, service, ui, motion], 
  ([$illustration, $editorial, $service, $ui, $motion]) => {
    return { 
      illustration: $illustration,
      editorial: $editorial,
      service: $service,
      ui: $ui,
      motion: $motion
    }
  })



// PRODUCTS
export const video = derived(([nodeSize, props]), ([$nodeSize, $p]) => {
  // Circle
  const cpos = [0, 0]
  const crad = $p[33]/2

  // Triangle
  const triangle = [
    [0, 0],
    [$p[12], $nodeSize*.2252],
    [-$p[12], $nodeSize*.2252],
  ]

  return { triangle, circle: { pos: cpos, radius: crad }}
})


export const publication = derived(props, $p => {
  // Center square
  const csquare = getRegPolyPoints(0, 0, $p[33], 4)

  // Upper square
  const usquare = [
    [$p[33]/2, -$p[15]],
    [$p[33]/2, -$p[32]],
    [-$p[33]/2, -$p[32]],
    [-$p[33]/2, -$p[15]],
  ]

  const shapes = [ csquare, usquare ]

  return { shapes }
})


export const report = derived(props, $p => {
  // Center square
  const square = getRegPolyPoints(0, 0, $p[33], 4, Math.PI/4)

  return { square }
})


export const presentation = derived(props, $p => {
  // Circle
  const cpos = [0, 0]
  const crad = [$p[33]/2]

  return { circle: { pos: cpos, radius: crad }}
})


export const siteInstitutional = derived(props, $p => {
  // Square
  const square = getRegPolyPoints(0, 0, $p[33], 4)

  // Triangle
  const triangle = [...square]
  triangle.splice(3, 1)

  return { triangle, square }
})


export const infographic = derived(props, $p => {
  // Outer triangle
  const otriangle = [
    [0, 0],
    [$p[50], $p[50]],
    [-$p[50], $p[50]],
  ]

  // Inner triangle
  const itriangle = [
    [0, $p[33]],
    [$p[16], $p[50]],
    [-$p[16], $p[50]],
  ]

  return { shapes: [ otriangle, itriangle ]}
})


export const siteEditorial = derived(props, $p => {
  const crad = $p[33]/2

  return { circle: { radius: crad }}
})


export const dashboard = derived(props, $p => {
  const cpos = [0, $p[50]]
  const crad1 = $p[50]
  const crad2 = $p[33]/2
  
  const circles = [crad1, crad2].map(radius => ({ pos: cpos, radius }))

  return { circles }
})


export const products = derived(([video, publication, report, presentation, siteInstitutional, infographic, siteEditorial, dashboard]),
([$video, $publication, $report, $presentation, $siteInstitutional, $infographic, $siteEditorial, $dashboard]) => {
  return {
    video: $video,
    publication: $publication,
    report: $report,
    presentation: $presentation,
    siteInstitutional: $siteInstitutional,
    infographic: $infographic,
    siteEditorial: $siteEditorial,
    dashboard: $dashboard
  }
})



// GOALS
export const goals = derived(([colorHeight, categories]), ([$h, $categories]) => {
  const { goals } = $categories

  if (!goals || !goals.length) {
    return
  }

  // Calculate color shape width
  const w = .75*$h

  //  are defined as [x, y, a1x, a1y, a2x, a2y]
  // Where a1 and a2 are anchors
  const points = [
    [0, 0, w*.25, 0, -w*.25, 0],
    [w*.5, -$h*.25, w*.5, -$h*.375, w*.5, -$h*.125],
    [0, -$h, -w*.5, -$h, w*.5, -$h],
    [-w*.5, -$h*.25, -w*.5, -$h*.125, -w*.5, -$h*.375]
  ]

  // Get angle that separates each axis
  const angle = 2*Math.PI/goals.length

  const shapes = {}

  for (let i=0; i<goals.length; i++) {
    const { id } = goals[i]

    shapes[id] = []

    // Rotate points around axis
    const theta = id * angle

    for (let point of points) {
      const newPoint = []

      for (let j=0; j<point.length/2; j++) {
        const rotatedPair = rotateAroundPoint(...point.slice(j*2, j*2+2), 0, 0, theta)
        newPoint.push(...rotatedPair)
      }

      shapes[id].push(newPoint)
    }
  }

  return shapes

})



// CHANNELS
export const consulting = derived(nodeSize, $nodeSize => {
  return $nodeSize/2 
})


export const digital = derived(nodeSize, $nodeSize => {
  return getRegPolyPoints(0, 0, $nodeSize, 4)
})


export const print = derived(nodeSize, $nodeSize => {
  return getRegPolyPoints(0, 0, $nodeSize, 6)
})


export const channels = derived([consulting, digital, print], ([$consulting, $digital, $print]) => {
  return { consulting: $consulting, digital: $digital, print: $print }
})