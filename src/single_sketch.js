import '../css/style.css'
await import('p5js-wrapper')
import { textBlocks } from './textblocks.js'

new p5(p => {
  let textAreas = []
  let dragging = false
  let dragIndex = -1
  let offsetX, offsetY
  let gradient
  const gridSize = 15

  p.preload = function () {
    // Load a monospace font
    p.font = p.loadFont('./saxmono.ttf')
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)

    setGradient()

    p.textSize(gridSize + 4) // this works, but is not a good rubric for other sizes
    p.textAlign(p.LEFT, p.TOP)
    p.textFont(p.font) // Set the font to the loaded monospace font

    // Select 3 random text blocks
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
        x: getRandomGridPosition(p.width / 2),
        y: getRandomGridPosition(p.height / 2),
        w: Math.max(...lines.map(line => line.length)) * gridSize,
        h: lines.length * gridSize
      })
    }

    display()
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

    // First, find the bounds of all text areas to normalize coordinates
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (let area of textAreas) {
      minX = Math.min(minX, Math.floor(area.x / gridSize))
      minY = Math.min(minY, Math.floor(area.y / gridSize))
      maxX = Math.max(
        maxX,
        Math.floor((area.x + area.lines[0].length * gridSize) / gridSize)
      )
      maxY = Math.max(
        maxY,
        Math.floor((area.y + area.lines.length * gridSize) / gridSize)
      )
    }

    // Calculate grid dimensions
    const gridWidth = maxX - minX + 1
    const gridHeight = maxY - minY + 1

    // Create 2D array filled with empty spaces
    const charGrid = Array(gridHeight)
      .fill()
      .map(() => Array(gridWidth).fill(' '))

    // Calculate offset to normalize to [0,0]
    const offsetX = -minX
    const offsetY = -minY

    // First pass: populate the normalized grid
    for (let area of textAreas) {
      const normalizedX = Math.floor(area.x / gridSize) + offsetX
      const normalizedY = Math.floor(area.y / gridSize) + offsetY

      for (let i = 0; i < area.lines.length; i++) {
        const line = area.lines[i]
        for (let j = 0; j < line.length; j++) {
          if (line[j] === ' ') continue

          // Only write to grid if position is empty (space character)
          if (charGrid[normalizedY + i][normalizedX + j] === ' ') {
            charGrid[normalizedY + i][normalizedX + j] = line[j]
          }
        }
      }
    }

    // Second pass: render the grid
    for (let y = 0; y < charGrid.length; y++) {
      for (let x = 0; x < charGrid[y].length; x++) {
        if (charGrid[y][x] !== ' ') {
          // Convert normalized grid coordinates back to canvas coordinates
          const canvasX = (x - offsetX) * gridSize
          const canvasY = (y - offsetY) * gridSize
          p.text(charGrid[y][x], canvasX, canvasY)
        }
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
      area.x = Math.round((p.mouseX - offsetX) / gridSize) * gridSize
      area.y = Math.round((p.mouseY - offsetY) / gridSize) * gridSize
    }
  }

  p.mouseReleased = () => {
    dragging = false
    dragIndex = -1
  }

  function getRandomGridPosition (max) {
    return Math.floor(Math.random() * (max / gridSize)) * gridSize
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    setGradient() // Recreate the gradient when the window is resized
  }
})
