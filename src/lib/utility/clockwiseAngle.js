export default function clockwiseAngle(cur, next) {
  // In a transition from one angle to another, tweens consider the shortest distance
  // between both angles to tween along.
  // This function always returns the next clockwise angle.
  return next < cur
    ? next + 2*Math.PI
    : next
}