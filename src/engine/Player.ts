import { Graphics, Text } from 'pixi.js'
import { Entity } from './Entity'
import { drawPivot } from '../utils/graphics'

/**
 * Player class that extends Entity
 * Handles player-specific properties and rendering
 */
export class Player extends Entity {
  private readonly name: string
  private readonly color: number
  private readonly PLAYER_SIZE: number = 2
  private message: string = ''
  private nameText: Text
  private messageText: Text

  constructor(id: string, name: string, color: number, x: number, y: number) {
    super()

    this.name = name
    this.color = color

    this.setMeta('id', id)
    this.setPosition(x, y)

    this.createGraphics()
  }

  private createGraphics(): void {
    const circle = new Graphics()
    circle.circle(0, 0, this.PLAYER_SIZE)
    circle.fill(this.color)
    circle.stroke({ color: 'white', pixelLine: true })
    this.container.addChild(circle)

    this.nameText = new Text({
      text: this.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 2,
        fill: 0xffffff
      },
      resolution: 10
    })
    this.nameText.pivot.set(this.nameText.width / 2, this.nameText.height / 2)
    this.nameText.x = circle.pivot.x
    this.nameText.y = -circle.height + 1
    this.container.addChild(this.nameText)

    this.messageText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 1.5,
        fill: 0x34ffff,
        wordWrap: true,
        wordWrapWidth: 10,
        breakWords: true
      },
      resolution: 10
    })
    this.messageText.pivot.set(0, 0)
    this.messageText.x = 3
    this.messageText.y = -2.5
    this.container.addChild(this.messageText)
  }

  /**
   * Update player message
   */
  setMessage(message: string): void {
    this.message = message || ''
    this.messageText.text = this.message
  }

  /**
   * Get player message
   */
  getMessage(): string {
    return this.message
  }

  /**
   * Get player name
   */
  getName(): string {
    return this.name
  }

  /**
   * Get player color
   */
  getColor(): number {
    return this.color
  }

  /**
   * Get player ID
   */
  getId(): string {
    return this.getMeta('id') as string
  }
}
