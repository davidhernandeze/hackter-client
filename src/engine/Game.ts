import { Application, Container, Graphics } from 'pixi.js'
import { Player } from './Player'
import Colyseus from 'colyseus.js'

/**
 * Game class that encapsulates game logic
 * Manages players, game state, and rendering
 */
export class Game {
  // PIXI Application
  private app: Application

  // World container for camera movement
  private worldContainer: Container

  // Grid background
  private gridGraphics: Graphics | null = null

  // Map of players by ID
  private players: Map<string, Player> = new Map()

  // Colyseus room
  private room: Colyseus.Room | null = null

  // Session ID of the current player
  private sessionId: string | null = null

  // Animation frame ID for the game loop
  private animationFrameId: number | null = null

  // Callback for game state changes
  private onStateChangeCallback: (() => void) | null = null

  constructor(canvas: HTMLCanvasElement) {
    // Initialize PIXI Application
    this.app = new Application()
    this.initializeApp(canvas).then(() => {
      // Start the game loop after initialization
      this.startGameLoop()
    })
  }

  /**
   * Initialize the PIXI Application
   */
  private async initializeApp(canvas: HTMLCanvasElement): Promise<void> {
    await this.app.init({ background: '#1b2e49', resizeTo: window })
    canvas.appendChild(this.app.canvas)

    // Create world container for camera movement
    this.worldContainer = new Container()
    this.app.stage.addChild(this.worldContainer)

    // Create grid background
    this.createGrid()
  }

  /**
   * Create a grid background
   */
  private createGrid(): void {
    // Create a new Graphics object for the grid
    this.gridGraphics = new Graphics()

    // Set grid properties
    const gridSize = 50 // Size of each grid cell
    const gridWidth = 5000 // Total width of the grid
    const gridHeight = 5000 // Total height of the grid
    const gridColor = 0x2a3f5f // Slightly lighter than the background

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

    // Add the grid to the world container (before any other elements)
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
    if (this.sessionId && this.players.has(this.sessionId)) {
      const currentPlayer = this.players.get(this.sessionId)!

      // Calculate center of the screen
      const screenCenterX = this.app.screen.width / 2
      const screenCenterY = this.app.screen.height / 2

      // Calculate target position for the world container
      const targetX = screenCenterX - currentPlayer.x
      const targetY = screenCenterY - currentPlayer.y

      // Smooth camera movement using lerp
      this.worldContainer.x = this.worldContainer.x + (targetX - this.worldContainer.x) * 0.05
      this.worldContainer.y = this.worldContainer.y + (targetY - this.worldContainer.y) * 0.05
    }
  }

  /**
   * Connect to the game server
   */
  async connectToServer(serverUrl: string, playerName: string): Promise<void> {
    try {
      const client = new Colyseus.Client(serverUrl)
      this.room = await client.joinOrCreate('arena', {
        name: playerName,
        color: Math.floor(Math.random() * 0xffffff),
      })

      console.log('joined successfully', this.room)
      this.sessionId = this.room.sessionId

      // Set up state change handler
      this.room.onStateChange((state) => {
        this.updatePlayers(state.players)

        // Call the callback if it exists
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

  /**
   * Update players based on server state
   */
  private updatePlayers(serverPlayers: any): void {
    // Remove players that no longer exist
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

    // Remove world container
    if (this.worldContainer.parent) {
      this.worldContainer.parent.removeChild(this.worldContainer)
    }
  }
}
