import * as d3 from "d3"

export function calculateAspectRatio(width, height) {
  return width / height;
}

export function randomDensity(maxInteger, size=100, normalize=true) {
  // Generate random distribution of integers
  const distribution = Array.from({ length: size }, d3.randomInt(maxInteger))

  // Create bins based on the max integer value
  const bin = d3.bin().thresholds(d3.range(maxInteger))

  // Calculate density (frequency distribution) for each bin
  let density = bin(distribution).map(d => d.length/size)

  // Normalize density values if required
  if (normalize) {
    const maxDensity = d3.max(density)
    density = density.map(d => +(d/maxDensity).toFixed(1))
  }

  return density
}

