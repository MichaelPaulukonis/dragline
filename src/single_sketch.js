import '../css/style.css'
await import('p5js-wrapper')
import { textBlocks } from './textblocks.js'

new p5(p => {
  let textAreas = []
  let dragging = false
  let dragIndex = -1
  let offsetX, offsetY
  let gradient
  let grid = {
    cols: 0,
    rows: 0,
    cellSize: 15
  }

  p.preload = function () {
    // Load a monospace font
    p.font = p.loadFont('./saxmono.ttf')
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    // Calculate grid dimensions based on canvas size
    grid.cols = Math.floor(p.width / grid.cellSize)
    grid.rows = Math.floor(p.height / grid.cellSize)
    p.noStroke()
    setGradient()

    p.textSize(grid.cellSize + 4) // this works for 15, but is not a good rubric for other sizes
    p.textAlign(p.LEFT, p.TOP)
    p.textFont(p.font)

    setupTextAreas(textAreas, grid.cellSize)

    display()
  }

  function setupTextAreas (textAreas, gridSize) {
    for (let i = 0; i < 6; i++) {
      let lines = textBlocks[Math.floor(Math.random() * textBlocks.length)].split('\n')
      textAreas.push({
        lines: lines,
        x: Math.floor(Math.random() * grid.cols),
        y: Math.floor(Math.random() * grid.rows),
        w: Math.max(...lines.map(line => line.length)),
        h: lines.length
      })
    }
  }

  const setGradient = () => {
    gradient = p.drawingContext.createLinearGradient(0, 0, p.width, 0)
    gradient.addColorStop(0, '#f8b500')
    gradient.addColorStop(1, '#fceabb')
  }

  function drawGradient () {
    // Apply the gradient to the canvas
    p.drawingContext.fillStyle = gradient
    p.drawingContext.fillRect(0, 0, p.width, p.height)
  }

  const display = () => {
    drawGradient()

    if (dragging) {
      p.fill(255, 255, 255, 100)
      // Convert grid coordinates to pixels for highlight rectangle
      p.rect(
        textAreas[dragIndex].x * grid.cellSize,
        textAreas[dragIndex].y * grid.cellSize,
        textAreas[dragIndex].w * grid.cellSize,
        textAreas[dragIndex].h * grid.cellSize
      )
    }
    p.fill(0)

    const fillChar = '.'

    // Create 2D array filled with dots
    const charGrid = Array(grid.rows)
      .fill()
      .map(() => Array(grid.cols).fill(fillChar))

    // Calculate offset to normalize to [0,0]
    const offsetX = -Math.min(...textAreas.map(area => area.x))
    const offsetY = -Math.min(...textAreas.map(area => area.y))

    // First pass: populate the normalized grid with text areas
    for (let area of textAreas) {
      const normalizedX = area.x + offsetX
      const normalizedY = area.y + offsetY

      for (let i = 0; i < area.lines.length; i++) {
        const line = area.lines[i]
        for (let j = 0; j < line.length; j++) {
          if (line[j] === fillChar) continue

          try {
            if (normalizedY + i < grid.rows && normalizedX + j < grid.cols) {
              if (charGrid[normalizedY + i][normalizedX + j] === fillChar) {
                charGrid[normalizedY + i][normalizedX + j] = line[j]
              }
            }
          } catch (error) {
            console.error(error)
            console.error(
              `Error at position (${normalizedX + j}, ${normalizedY + i})`
            )
          }
        }
      }
    }

    // Second pass: render the grid - only convert to pixels here
    for (let y = 0; y < charGrid.length; y++) {
      for (let x = 0; x < charGrid[y].length; x++) {
        const canvasX = x * grid.cellSize
        const canvasY = y * grid.cellSize
        p.text(charGrid[y][x], canvasX, canvasY)
      }
    }
  }

  p.draw = () => {
    if (!dragging) return
    display()
  }

  p.mousePressed = () => {
    for (let i = 0; i < textAreas.length; i++) {
      let area = textAreas[i]
      // Convert grid coordinates to pixels for hit testing
      const pixelX = area.x * grid.cellSize
      const pixelY = area.y * grid.cellSize
      const pixelW = area.w * grid.cellSize
      const pixelH = area.h * grid.cellSize

      if (
        p.mouseX > pixelX &&
        p.mouseX < pixelX + pixelW &&
        p.mouseY > pixelY &&
        p.mouseY < pixelY + pixelH
      ) {
        dragging = true
        dragIndex = i
        offsetX = p.mouseX - pixelX
        offsetY = p.mouseY - pixelY
        break
      }
    }
  }

  p.mouseDragged = () => {
    if (dragging) {
      let area = textAreas[dragIndex]
      // Convert mouse position to grid coordinates directly
      area.x = Math.floor((p.mouseX - offsetX) / grid.cellSize)
      area.y = Math.floor((p.mouseY - offsetY) / grid.cellSize)
    }
  }

  p.mouseReleased = () => {
    dragging = false
    // dragIndex = -1
    display() // Redraw the grid to remove the highlight
  }

  function getRandomGridPosition (max) {
    return Math.floor(Math.random() * (max / grid.cellSize)) * grid.cellSize
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    setGradient() // Recreate the gradient when the window is resized
  }

  p.keyPressed = () => {
    // Only handle key events if we're currently dragging a text area
    if (!dragging || dragIndex === -1) return

    // NOTE: down increases / up decreases
    // because lower text index has priority in display
    if (p.keyCode === p.DOWN_ARROW) {
      // Move the text area up in the array (if not already at the top)
      if (dragIndex < textAreas.length - 1) {
        // Swap the current text area with the one above it
        ;[textAreas[dragIndex], textAreas[dragIndex + 1]] = [
          textAreas[dragIndex + 1],
          textAreas[dragIndex]
        ]
        // Update dragIndex to follow the moved text area
        dragIndex++
        display() // Redraw to show the new order
      }
    } else if (p.keyCode === p.UP_ARROW) {
      // Move the text area down in the array (if not already at the bottom)
      if (dragIndex > 0) {
        // Swap the current text area with the one below it
        ;[textAreas[dragIndex], textAreas[dragIndex - 1]] = [
          textAreas[dragIndex - 1],
          textAreas[dragIndex]
        ]
        // Update dragIndex to follow the moved text area
        dragIndex--
        display() // Redraw to show the new order
      }
    }
  }
})
