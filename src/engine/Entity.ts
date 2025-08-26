import { Container } from 'pixi.js';

/**
 * Base class for all game entities
 * Holds common properties like position and metadata
 */
export class Entity {
  // PIXI Container for rendering
  protected container: Container;

  // Position properties
  protected _x: number = 0;
  protected _y: number = 0;

  // Target position for smooth movement
  protected targetX: number = 0;
  protected targetY: number = 0;

  // Metadata properties
  protected meta: Record<string, any> = {};

  constructor() {
    this.container = new Container();
  }

  /**
   * Update entity position with interpolation
   * @param deltaTime Time since last update
   * @param lerpFactor Interpolation factor (0-1)
   */
  update(deltaTime: number, lerpFactor: number = 0.1): void {
    // Smooth movement using linear interpolation
    this._x = this._x + (this.targetX - this._x) * lerpFactor;
    this._y = this._y + (this.targetY - this._y) * lerpFactor;

    // Update container position
    this.container.x = this._x;
    this.container.y = this._y;
  }

  /**
   * Set the target position for smooth movement
   */
  setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Set the position immediately (no interpolation)
   */
  setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
    this.targetX = x;
    this.targetY = y;
    this.container.x = x;
    this.container.y = y;
  }

  /**
   * Get the PIXI container for this entity
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get current X position
   */
  get x(): number {
    return this._x;
  }

  /**
   * Get current Y position
   */
  get y(): number {
    return this._y;
  }

  /**
   * Set metadata value
   */
  setMeta(key: string, value: any): void {
    this.meta[key] = value;
  }

  /**
   * Get metadata value
   */
  getMeta(key: string): any {
    return this.meta[key];
  }

  /**
   * Check if metadata key exists
   */
  hasMeta(key: string): boolean {
    return key in this.meta;
  }
}
