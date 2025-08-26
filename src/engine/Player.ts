import { Graphics, Text } from 'pixi.js';
import { Entity } from './Entity';

/**
 * Player class that extends Entity
 * Handles player-specific properties and rendering
 */
export class Player extends Entity {
  private name: string;
  private color: number;
  private message: string = '';
  private nameText: Text;
  private messageText: Text;

  constructor(id: string, name: string, color: number, x: number, y: number) {
    super();

    this.name = name;
    this.color = color;

    // Store the player ID in metadata
    this.setMeta('id', id);

    // Set initial position
    this.setPosition(x, y);

    // Create player graphics
    this.createGraphics();
  }

  /**
   * Create the visual representation of the player
   */
  private createGraphics(): void {
    // Create player circle
    const circle = new Graphics();
    circle.circle(0, 0, 20);
    circle.fill(this.color);
    this.container.addChild(circle);

    // Create player name text
    this.nameText = new Text({
      text: this.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
      },
    });
    this.nameText.x = -(this.container.width / 2) + 5;
    this.nameText.y = -this.container.height;
    this.container.addChild(this.nameText);

    // Create message text
    this.messageText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0x34ffff,
        wordWrap: true,
      },
    });
    this.messageText.x = this.container.width - 10;
    this.messageText.y = -5;
    this.container.addChild(this.messageText);
  }

  /**
   * Update player message
   */
  setMessage(message: string): void {
    this.message = message || '';
    this.messageText.text = this.message;
  }

  /**
   * Get player message
   */
  getMessage(): string {
    return this.message;
  }

  /**
   * Get player name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get player color
   */
  getColor(): number {
    return this.color;
  }

  /**
   * Get player ID
   */
  getId(): string {
    return this.getMeta('id') as string;
  }
}
