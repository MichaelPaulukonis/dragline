import '../css/style.css'
await import('p5js-wrapper')
const blocks = await import('./blocks')
// import tumblrRandomPost from './tumblr-random'
// let corpus = await tumblrRandomPost()

new p5(p => {
  let textAreas = []
  let dragging = false
  let selectedIndex = -1
  let offsetX, offsetY
  let gradient
  let grid = {
    cols: 0,
    rows: 0,
    cellSize: 15
  }
  const fillChar = ' '
  let monospaceFont = null

  p.preload = function () {
    monospaceFont = p.loadFont('saxmono.ttf')
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    // Calculate grid dimensions based on canvas size
    grid.cols = Math.floor(p.width / grid.cellSize)
    grid.rows = Math.floor(p.height / grid.cellSize)
    p.textFont(monospaceFont)
    p.noStroke()
    setGradient()

    p.textSize(grid.cellSize + 4) // this works for 15, but is not a good rubric for other sizes
    p.textAlign(p.LEFT, p.TOP)

    setupTextAreas(textAreas)

    display()
  }

  function setupTextAreas (textAreas) {
    for (let i = 0; i < 10; i++) {
      let lines = blocks.default[Math.floor(Math.random() * blocks.default.length)].map(line =>
        line.replace(/ /g, fillChar)
      )
      textAreas.push({
        lines: lines,
        x: Math.floor((Math.random() * grid.cols) / 2),
        y: Math.floor((Math.random() * grid.rows) / 2),
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
    p.drawingContext.fillStyle = gradient
    p.drawingContext.fillRect(0, 0, p.width, p.height)
  }

  const display = () => {
    drawGradient()

    if (dragging) {
      // Create a color variation based on selectedIndex
      // const hue = (selectedIndex * 60) % 360;  // Rotate through hues (0-360)
      const minHue = 240;   // yellow
      const maxHue = 60;  // blue
      const hueRange = maxHue - minHue;
      const hue = maxHue - ((selectedIndex * (hueRange / textAreas.length)) % hueRange);
      
      const saturation = 50;  // Keep moderate saturation
      const brightness = 100; // Keep full brightness
      const alpha = 100;      // Keep same transparency
    
      p.colorMode(p.HSB);  // Switch to HSB color mode
      p.fill(hue, saturation, brightness, alpha);
      
      // Draw the highlight rectangle
      p.rect(
        textAreas[selectedIndex].x * grid.cellSize,
        textAreas[selectedIndex].y * grid.cellSize,
        textAreas[selectedIndex].w * grid.cellSize,
        textAreas[selectedIndex].h * grid.cellSize
      );
      
      p.colorMode(p.RGB);  // Switch back to RGB mode
      p.fill(0);  // Reset fill to black for text
    }
    p.fill(0)

    // Create 2D array filled with dots
    const charGrid = Array(grid.rows)
      .fill()
      .map(() => Array(grid.cols).fill(fillChar))

    const withinGrid = (area, i, j) => {
      return (
        area.y + i >= 0 &&
        area.y + i < grid.rows &&
        area.x + j >= 0 &&
        area.x + j < grid.cols
      )
    }

    // First pass: populate the normalized grid with text areas
    for (let area of textAreas) {
      for (let i = 0; i < area.lines.length; i++) {
        const line = area.lines[i]
        for (let j = 0; j < line.length; j++) {
          if (line[j] === fillChar) continue

          try {
            if (
              withinGrid(area, i, j) &&
              charGrid[area.y + i][area.x + j] === fillChar
            ) {
              charGrid[area.y + i][area.x + j] = line[j]
            }
          } catch (error) {
            console.error(error)
            console.error(`Error at position (${area.x + j}, ${area.y + i})`)
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
        selectedIndex = i
        offsetX = p.mouseX - pixelX
        offsetY = p.mouseY - pixelY
        break
      }
    }
  }

  p.mouseDragged = () => {
    if (dragging) {
      let area = textAreas[selectedIndex]
      // Convert mouse position to grid coordinates directly
      area.x = Math.floor((p.mouseX - offsetX) / grid.cellSize)
      area.y = Math.floor((p.mouseY - offsetY) / grid.cellSize)
    }
  }

  p.mouseReleased = () => {
    dragging = false
    // selectedIndex = -1
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
    if (!dragging || selectedIndex === -1) return

    // NOTE: down increases / up decreases
    // because lower text index has priority in display
    if (p.keyCode === p.DOWN_ARROW) {
      // Move the text area up in the array (if not already at the top)
      if (selectedIndex < textAreas.length - 1) {
        // Swap the current text area with the one above it
        ;[textAreas[selectedIndex], textAreas[selectedIndex + 1]] = [
          textAreas[selectedIndex + 1],
          textAreas[selectedIndex]
        ]
        // Update selectedIndex to follow the moved text area
        selectedIndex++
        display() // Redraw to show the new order
      }
    } else if (p.keyCode === p.UP_ARROW) {
      // Move the text area down in the array (if not already at the bottom)
      if (selectedIndex > 0) {
        // Swap the current text area with the one below it
        ;[textAreas[selectedIndex], textAreas[selectedIndex - 1]] = [
          textAreas[selectedIndex - 1],
          textAreas[selectedIndex]
        ]
        // Update selectedIndex to follow the moved text area
        selectedIndex--
        display() // Redraw to show the new order
      }
    }
  }
})
