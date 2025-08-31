import { Graphics } from 'pixi.js'

export function drawPoint(container, x, y) {
  const circle = new Graphics()
  circle.circle(x, y, 0.3)
  circle.fill('red')
  container.addChild(circle)
}

export function drawPivot(container) {
  drawPoint(container, container.pivot.x, container.pivot.y)
}
