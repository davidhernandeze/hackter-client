import { Graphics } from 'pixi.js'

export function createPoint(container, x, y) {
  const circle = new Graphics()
  circle.circle(x, y, 0.3)
  circle.fill('red')
  container.addChild(circle)
  return circle
}

export function drawPivot(container) {
  createPoint(container, container.pivot.x, container.pivot.y)
}

let lastDebugPoint = null
export function drawDebugPoint(container, x, y) {
  if (!lastDebugPoint) {
    lastDebugPoint = createPoint(container, 0, 0)
  }
  lastDebugPoint.x = x
  lastDebugPoint.y = y
}

let lastDebugCircle = null
export function drawDebugCircle(container, x, y, radius) {
  if (!lastDebugCircle) {
    lastDebugCircle = new Graphics()
    container.addChild(lastDebugCircle)
    lastDebugCircle.circle(0, 0, radius)
    lastDebugCircle.stroke({ color: 'red', pixelLine: true, width: 1 })
  }
  lastDebugCircle.x = x
  lastDebugCircle.y = y
}
