export default function rotateAroundPoint(x, y, cx, cy, theta) {
  // Translate the point to the origin
  const translatedX = x - cx;
  const translatedY = y - cy;

  // Perform the rotation
  const rotatedX = translatedX * Math.cos(theta) - translatedY * Math.sin(theta);
  const rotatedY = translatedX * Math.sin(theta) + translatedY * Math.cos(theta);

  // Translate the point back to its original position
  const finalX = rotatedX + cx;
  const finalY = rotatedY + cy;

  return [ finalX, finalY ]
}