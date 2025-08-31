import { Container } from 'pixi.js';
import { drawPivot } from '../utils/graphics';

export class Entity {
  protected container: Container;

  protected _x: number = 0;
  protected _y: number = 0;

  protected targetX: number = 0;
  protected targetY: number = 0;

  protected meta: Record<string, any> = {};

  constructor() {
    this.container = new Container();
  }

  update(deltaTime: number, lerpFactor: number = 0.1): void {
    this._x = this._x + (this.targetX - this._x) * lerpFactor;
    this._y = this._y + (this.targetY - this._y) * lerpFactor;

    this.container.x = this._x;
    this.container.y = this._y;
    // drawPivot(this.container)
  }

  setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
    this.targetX = x;
    this.targetY = y;
    this.container.x = x;
    this.container.y = y;
  }

  getContainer(): Container {
    return this.container;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  setMeta(key: string, value: any): void {
    this.meta[key] = value;
  }

  getMeta(key: string): any {
    return this.meta[key];
  }

  hasMeta(key: string): boolean {
    return key in this.meta;
  }
}
