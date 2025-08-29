import { Application, Container, Graphics } from 'pixi.js'
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
  private onStateChangeCallback: (() => void) | null = null
  private isCurrentPlayerDeleted: boolean = false
  private readonly GRID_SIZE = 10

  private cameraZoom: number = 5

  constructor(divContainer: HTMLDivElement) {
    this.app = new Application()
    this.divContainer = divContainer
  }

  async connectToServer(serverUrl: string, playerName: string): Promise<void> {
    try {
      const client = new Colyseus.Client(serverUrl)
      this.room = await client.joinOrCreate('arena', {
        name: playerName,
        color: Math.floor(Math.random() * 0xffffff),
      })

      console.log('joined successfully', this.room)
      this.sessionId = this.room.sessionId
      console.log('sessionId', this.sessionId)

      await this.initializeApp(this.divContainer)
      this.startGameLoop()

      this.room.onStateChange((state) => {
        if (state.mapVertices && state.mapVertices.length >= 6) {
          this.drawMapPolygon(state.mapVertices)
        }

        this.updatePlayers(state.players)

        if (this.onStateChangeCallback) {
          this.onStateChangeCallback()
        }
      })

      return Promise.resolve()
    } catch (error) {
      console.error('Failed to connect to server:', error)
      return Promise.reject(error)
    }
  }

  private async initializeApp(divContainer: HTMLDivElement): Promise<void> {
    await this.app.init({ background: '#1b2e49', resizeTo: divContainer })
    divContainer.appendChild(this.app.canvas)

    this.worldContainer = new Container()
    this.app.stage.addChild(this.worldContainer)

    this.createGrid()
  }

  private createGrid(): void {
    this.gridGraphics = new Graphics()

    const gridSize = this.GRID_SIZE
    const gridWidth = 100000
    const gridHeight = 100000
    const gridColor = 0x2a3f5f

    // Draw vertical lines
    for (let x = -gridWidth / 2; x <= gridWidth / 2; x += gridSize) {
      this.gridGraphics.moveTo(x, -gridHeight / 2)
      this.gridGraphics.lineTo(x, gridHeight / 2)
      this.gridGraphics.stroke({ color: gridColor, pixelLine: true })
    }
    // Draw horizontal lines

    for (let y = -gridHeight / 2; y <= gridHeight / 2; y += gridSize) {
      this.gridGraphics.moveTo(-gridWidth / 2, y)
      this.gridGraphics.lineTo(gridWidth / 2, y)
      this.gridGraphics.stroke({ color: gridColor, pixelLine: true })
    }

    this.worldContainer.addChild(this.gridGraphics)
  }

  /**
   * Start the game loop
   */
  startGameLoop(): void {
    // Cancel any existing animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }

    const updateFrame = () => {
      // Update all players
      for (const player of this.players.values()) {
        player.update(0, 0.1) // Using fixed lerp factor for now
      }

      // Camera follow logic - center on current player
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

    // Apply zoom level
    this.worldContainer.scale.set(this.cameraZoom)
  }


  /**
   * Draw map polygon from vertices
   */
  private drawMapPolygon(mapVertices: number[]): void {
    // Clear existing polygon if it exists
    if (this.mapPolygon) {
      if (this.mapPolygon.parent) {
        this.mapPolygon.parent.removeChild(this.mapPolygon)
      }
      this.mapPolygon = null
    }

    // Create a new Graphics object for the polygon
    this.mapPolygon = new Graphics()

    // Start drawing the polygon
    if (mapVertices.length >= 2) {
      this.mapPolygon.moveTo(mapVertices[0], mapVertices[1])

      // Add each vertex to the polygon
      for (let i = 2; i < mapVertices.length; i += 2) {
        if (i + 1 < mapVertices.length) {
          this.mapPolygon.lineTo(mapVertices[i], mapVertices[i + 1])
          this.mapPolygon.stroke({ color: 'red', width: 2})
        }
      }

      // Close the polygon
      this.mapPolygon.lineTo(mapVertices[0], mapVertices[1])
      this.gridGraphics.stroke({ color: 'red', width: 2 })
    }

    this.mapPolygon.endFill()

    // Add the polygon to the world container (after grid but before players)
    this.worldContainer.addChildAt(this.mapPolygon, 1)
  }

  /**
   * Update players based on server state
   */
  private updatePlayers(serverPlayers: any): void {
    // Remove players that no longer exist
    for (const [id, player] of this.players) {
      if (!serverPlayers.has(id)) {
        this.worldContainer.removeChild(player.getContainer())
        this.players.delete(id)

        // Check if the deleted player is the current player
        if (id === this.sessionId) {
          this.isCurrentPlayerDeleted = true
        }
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
  sendCommand(command: string): void {
    if (this.room) {
      this.room.send('command', command)
    }
  }

  /**
   * Set callback for game state changes
   */
  onStateChange(callback: () => void): void {
    this.onStateChangeCallback = callback
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

  /**
   * Set camera zoom level
   * @param zoom - Zoom level (1.0 is normal, >1 zooms in, <1 zooms out)
   */
  setCameraZoom(zoom: number): void {
    // Ensure zoom is within reasonable limits
    this.cameraZoom = Math.max(0.1, Math.min(zoom, 10.0))
  }

  /**
   * Get current camera zoom level
   */
  getCameraZoom(): number {
    return this.cameraZoom
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopGameLoop()

    // Disconnect from server
    if (this.room) {
      this.room.leave()
      this.room = null
    }

    // Clear players
    this.players.clear()

    // Clean up grid graphics
    if (this.gridGraphics) {
      if (this.gridGraphics.parent) {
        this.gridGraphics.parent.removeChild(this.gridGraphics)
      }
      this.gridGraphics = null
    }

    // Clean up map polygon
    if (this.mapPolygon) {
      if (this.mapPolygon.parent) {
        this.mapPolygon.parent.removeChild(this.mapPolygon)
      }
      this.mapPolygon = null
    }

    // Remove world container
    if (this.worldContainer.parent) {
      this.worldContainer.parent.removeChild(this.worldContainer)
    }
  }
}
