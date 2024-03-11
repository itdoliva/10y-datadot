function polarAngle(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

function orientation(p, q, r) {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (val === 0) {
        return 0; // Collinear points
    }
    return val > 0 ? 1 : 2; // Clockwise or counterclockwise
}

export default function grahamScan(points) {
    const n = points.length;
    if (n < 3) {
        return points; // Convex hull is not possible with less than 3 points
    }

    // Find the point with the lowest y-coordinate (and leftmost if tied)
    const pivot = points.reduce((min, p) => (p[1] < min[1] || (p[1] === min[1] && p[0] < min[0])) ? p : min, points[0]);

    // Sort the points based on polar angle with respect to the pivot
    const sortedPoints = points.slice().sort((p1, p2) => polarAngle(pivot, p1) - polarAngle(pivot, p2));

    // Initialize the convex hull with the pivot and the first two sorted points
    const convexHull = [pivot, sortedPoints[0], sortedPoints[1]];

    // Iterate through the sorted points to build the convex hull
    for (let i = 2; i < n; i++) {
        while (convexHull.length > 1 && orientation(convexHull[convexHull.length - 2], convexHull[convexHull.length - 1], sortedPoints[i]) !== 1) {
            convexHull.pop();
        }
        convexHull.push(sortedPoints[i]);
    }

    return convexHull;
}