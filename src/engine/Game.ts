import { Application, Container, Graphics, GraphicsPath, Text } from 'pixi.js'
import { Player } from './Player'
import Colyseus from 'colyseus.js'

/**
 * Game class that encapsulates game logic
 * Manages players, game state, and rendering
 */
export class Game {
  private app: Application
  private readonly divContainer: HTMLDivElement
  private worldContainer: Container
  private gridGraphics: Graphics | null = null
  private mapPolygon: Graphics | null = null
  private players: Map<string, Player> = new Map()
  private room: Colyseus.Room | null = null
  private sessionId: string | null = null
  private animationFrameId: number | null = null
  private onPlayerDeletedCallback: (() => void) | null = null
  private isCurrentPlayerDeleted: boolean = false
  private readonly GRID_SIZE = 10

  private cameraZoom: number = 5

  constructor(divContainer: HTMLDivElement) {
    this.app = new Application()
    this.divContainer = divContainer
  }

  async connectToServer(serverUrl: string, playerName: string, reconnectToken: string): Promise<void> {
    try {
      const client = new Colyseus.Client(serverUrl)
      this.room = await client.joinOrCreate('arena', {
        name: playerName,
        color: Math.floor(Math.random() * 0xffffff),
        token: reconnectToken
      })

      this.room.onStateChange((state) => {
        this.drawMapPolygon(state.mapVertices)
        this.updatePlayers(state.players)
      })

      this.room.onLeave((code) => {
        console.log('Left the room with code:', code)
        this.onPlayerDeletedCallback()
      })

      console.log('joined successfully', this.room)
      this.sessionId = this.room.sessionId
      console.log('sessionId', this.sessionId)

      return Promise.resolve()
    } catch (error) {
      console.error('Failed to connect to server:', error)
      return Promise.reject(error)
    }
  }

  public async initializeApp(): Promise<void> {
    await this.app.init({ background: '#1b2e49', resizeTo: this.divContainer })
    this.divContainer.appendChild(this.app.canvas)

    this.worldContainer = new Container()
    this.app.stage.addChild(this.worldContainer)

    this.createGrid()
    this.startGameLoop()
  }

  private createGrid(): void {
    this.gridGraphics = new Graphics()

    const gridSize = this.GRID_SIZE
    const gridWidth = 100000
    const gridHeight = 100000
    const gridColor = 0x2a3f5f

    for (let x = -gridWidth / 2; x <= gridWidth / 2; x += gridSize) {
      this.gridGraphics.moveTo(x, -gridHeight / 2)
      this.gridGraphics.lineTo(x, gridHeight / 2)
      this.gridGraphics.stroke({ color: gridColor, pixelLine: true })
    }

    for (let y = -gridHeight / 2; y <= gridHeight / 2; y += gridSize) {
      this.gridGraphics.moveTo(-gridWidth / 2, y)
      this.gridGraphics.lineTo(gridWidth / 2, y)
      this.gridGraphics.stroke({ color: gridColor, pixelLine: true })
    }

    this.worldContainer.addChild(this.gridGraphics)
    this.worldContainer.scale.set(this.cameraZoom)
  }

  startGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }

    const updateFrame = () => {
      for (const player of this.players.values()) {
        player.update(0, 0.25) // Small number target point is far from sprite center
      }

      this.updateCamera()

      this.animationFrameId = requestAnimationFrame(updateFrame)
    }

    this.animationFrameId = requestAnimationFrame(updateFrame)
  }

  /**
   * Stop the game loop
   */
  stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Update camera position to follow current player
   */
  private updateCamera(): void {
    if (!this.sessionId || !this.players.has(this.sessionId)) return
    const currentPlayer = this.players.get(this.sessionId)!

    const screenCenterX = this.app.screen.width / 2
    const screenCenterY = this.app.screen.height / 2

    // Calculate target position to center the player
    // We need to position the world container so that the player is at the center of the screen
    const targetX = screenCenterX - currentPlayer.x * this.cameraZoom
    const targetY = screenCenterY - currentPlayer.y * this.cameraZoom

    // Apply smooth movement using lerp (linear interpolation)
    this.worldContainer.x = this.worldContainer.x + (targetX - this.worldContainer.x) * 0.1
    this.worldContainer.y = this.worldContainer.y + (targetY - this.worldContainer.y) * 0.1

    this.gridGraphics.x = this.worldContainer.x * 0.05
    this.gridGraphics.y = this.worldContainer.y * 0.05
  }

  /**
   * Draw map polygon from vertices
   */
  private drawMapPolygon(mapVertices: number[]): void {
    if (this.mapPolygon) return

    const mapPath = new GraphicsPath()

    mapPath.moveTo(mapVertices[0], mapVertices[1])

    for (let i = 2; i < mapVertices.length; i += 2) {
      if (i + 1 < mapVertices.length) {
        mapPath.lineTo(mapVertices[i], mapVertices[i + 1])
      }
    }

    mapPath.lineTo(mapVertices[0], mapVertices[1])
    mapPath.closePath()

    this.mapPolygon = new Graphics()
    this.mapPolygon.path(mapPath)
    this.mapPolygon.stroke({ color: 'red', width: 0.2 })

    const mapPolygonBackground = new Graphics()
    mapPolygonBackground.path(mapPath)
    mapPolygonBackground.fill({ color: 'rgba(255,255,255,0.06)' })

    this.worldContainer.addChildAt(this.mapPolygon, 1)
    this.worldContainer.addChildAt(mapPolygonBackground, 2)

    const adviceText = new Text({
      text: 'Do not touch the walls!',
      style: {
        fontFamily: 'Arial',
        fontSize: 6,
        fill: 'rgba(255,255,255,0.07)',
        wordWrap: true
      },
      resolution: 10
    })
    adviceText.x = 20
    adviceText.y = 20
    this.worldContainer.addChild(adviceText)
  }

  private updatePlayers(serverPlayers: any): void {
    for (const [id, player] of this.players) {
      if (!serverPlayers.has(id)) {
        this.worldContainer.removeChild(player.getContainer())
        this.players.delete(id)
      }
    }

    // Update existing players and add new ones
    for (const [id, serverPlayer] of serverPlayers) {
      if (!this.players.has(id)) {
        // Create new player
        const player = new Player(
          id,
          serverPlayer.name,
          serverPlayer.color,
          serverPlayer.x,
          serverPlayer.y,
        )

        // Add player container to world
        this.worldContainer.addChild(player.getContainer())

        // Add player to map
        this.players.set(id, player)
      } else {
        // Update existing player
        const player = this.players.get(id)!

        // Update target position for smooth movement
        player.setTargetPosition(serverPlayer.x, serverPlayer.y)


        // Update message directly
        player.setMessage(serverPlayer.message || '')
      }
    }
  }

  /**
   * Send a command to the server
   */
  public sendCommand(command: string): void {
    if (this.room) {
      this.room.send('command', command)
    }
  }

  /**
   * Set callback for game state changes
   */
  onPlayerDeleted(callback: () => void): void {
    this.onPlayerDeletedCallback = callback
  }

  /**
   * Get the current player's session ID
   */
  getSessionId(): string | null {
    return this.sessionId
  }

  /**
   * Get a player by ID
   */
  getPlayer(id: string): Player | undefined {
    return this.players.get(id)
  }

  /**
   * Get all players
   */
  getPlayers(): Map<string, Player> {
    return this.players
  }

  /**
   * Check if current player is deleted
   */
  isPlayerDeleted(): boolean {
    return this.isCurrentPlayerDeleted
  }

  setCameraZoom(zoom: number): void {
    this.cameraZoom = Math.max(0.1, Math.min(zoom, 10.0))
    this.worldContainer.scale.set(this.cameraZoom)
  }

  /**
   * Get current camera zoom level
   */
  getCameraZoom(): number {
    return this.cameraZoom
  }
}
