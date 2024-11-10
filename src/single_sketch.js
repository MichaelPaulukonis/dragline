import '../css/style.css'
await import('p5js-wrapper')
import { textBlocks } from './textblocks.js'

new p5(p => {
  let textAreas = []
  let dragging = false
  let dragIndex = -1
  let offsetX, offsetY
  let gradient
  const cellSize = 15

  p.preload = function () {
    // Load a monospace font
    p.font = p.loadFont('./saxmono.ttf')
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.noStroke()
    setGradient()

    p.textSize(cellSize + 4) // this works for 15, but is not a good rubric for other sizes
    p.textAlign(p.LEFT, p.TOP)
    p.textFont(p.font)

    setupTextAreas(textAreas, cellSize)

    display()
  }

  function setupTextAreas (textAreas, gridSize) {
    let selectedTextBlocks = []
    while (selectedTextBlocks.length < 6) {
      let randomIndex = Math.floor(Math.random() * textBlocks.length)
      selectedTextBlocks.push(textBlocks[randomIndex])
    }

    // Define text areas with random grid-aligned positions
    for (let text of selectedTextBlocks) {
      let lines = text.split('\n')
      textAreas.push({
        lines: lines,
        // TODO: use grid positions, not full-canvas x/y
        x: getRandomGridPosition(p.width / 2),
        y: getRandomGridPosition(p.height / 2),
        // use letter/grid count for w/h
        w: Math.max(...lines.map(line => line.length)) * gridSize,
        h: lines.length * gridSize
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

    // if dragging, highlight area of index
    if (dragging) {
      p.fill(255, 255, 255, 100)
      p.rect(
        textAreas[dragIndex].x,
        textAreas[dragIndex].y,
        textAreas[dragIndex].w,
        textAreas[dragIndex].h
      )
    }
    p.fill(0)

    // Calculate grid dimensions based on canvas size
    const gridWidth = Math.floor(p.width / cellSize)
    const gridHeight = Math.floor(p.height / cellSize)

    const fillChar = '.'

    // Create 2D array filled with dots
    const charGrid = Array(gridHeight)
      .fill()
      .map(() => Array(gridWidth).fill(fillChar))

    // Calculate offset to normalize to [0,0]
    const offsetX = -Math.min(
      ...textAreas.map(area => Math.floor(area.x / cellSize))
    )
    const offsetY = -Math.min(
      ...textAreas.map(area => Math.floor(area.y / cellSize))
    )

    // First pass: populate the normalized grid with text areas
    for (let area of textAreas) {
      const normalizedX = Math.floor(area.x / cellSize) + offsetX
      const normalizedY = Math.floor(area.y / cellSize) + offsetY

      for (let i = 0; i < area.lines.length; i++) {
        const line = area.lines[i]
        for (let j = 0; j < line.length; j++) {
          if (line[j] === fillChar) continue

          try {
            if (normalizedY + i < gridHeight && normalizedX + j < gridWidth) {
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

    // Second pass: render the grid - simply multiply grid coordinates by gridSize
    for (let y = 0; y < charGrid.length; y++) {
      for (let x = 0; x < charGrid[y].length; x++) {
        const canvasX = x * cellSize
        const canvasY = y * cellSize
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
      if (
        p.mouseX > area.x &&
        p.mouseX < area.x + area.w &&
        p.mouseY > area.y &&
        p.mouseY < area.y + area.h
      ) {
        dragging = true
        dragIndex = i
        offsetX = p.mouseX - area.x
        offsetY = p.mouseY - area.y
        break
      }
    }
  }

  p.mouseDragged = () => {
    if (dragging) {
      let area = textAreas[dragIndex]
      area.x = Math.round((p.mouseX - offsetX) / cellSize) * cellSize
      area.y = Math.round((p.mouseY - offsetY) / cellSize) * cellSize
    }
  }

  p.mouseReleased = () => {
    dragging = false
    // dragIndex = -1
    display() // Redraw the grid to remove the highlight
  }

  function getRandomGridPosition (max) {
    return Math.floor(Math.random() * (max / cellSize)) * cellSize
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
