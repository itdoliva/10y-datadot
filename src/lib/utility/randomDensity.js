import * as d3 from "d3"

export default function randomDensity(maxInteger, size=100, normalize=true) {
  const distribution = Array.from({ length: size }, d3.randomInt(maxInteger))

  const bin = d3.bin().thresholds(d3.range(maxInteger))

  let density = bin(distribution).map(d => d.length/size)

  if (normalize) {
    const maxDensity = d3.max(density)
    density = density.map(d => +(d/maxDensity).toFixed(1))
  }

  return density
}