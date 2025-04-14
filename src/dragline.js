import '../css/style.css'
await import('p5js-wrapper')
import gridify from './text-grid'
const fallbackBlocks = await import('./grids.20250403T123247766Z.json')
import tumblrRandomPost from './tumblr-random'

let corpus
let blocks

async function initializeBlocks () {
  try {
    corpus = await tumblrRandomPost()
    blocks = gridify(corpus.join('\n'))
  } catch (error) {
    console.error(
      'Failed to fetch or process data from tumblrRandomPost. Falling back to JSON import.',
      error
    )
    blocks = fallbackBlocks.default
  }
}

await initializeBlocks()

// amazonq-ignore-next-line
new p5(p => {
  let textAreas = []
  let dragging = false
  let selectedIndex = -1
  let blockCount = 10
  let clusteringDistance = 5 // Adjust this value to control clustering tightness

  let offsetX, offsetY
  let gradient
  let grid = {
    cols: 0,
    rows: 0,
    cellSize: 15
  }
  let fillChars = ' .-|:*+'
  let fillChar = fillChars[0]
  let monospaceFont = null

  const infoBox = document.getElementById('info-box')
  const closeButton = document.getElementById('close-info-box')

  const toggleInfoBox = () => {
    if (infoBox.classList.contains('hidden')) {
      infoBox.classList.remove('hidden')
    } else {
      infoBox.classList.add('hidden')
    }
  }

  closeButton.addEventListener('click', () => {
    toggleInfoBox()
  })

  p.preload = function () {
    monospaceFont = p.loadFont('saxmono.ttf')
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    // Calculate grid dimensions based on canvas size
    // amazonq-ignore-next-line
    grid.cols = Math.floor(p.width / grid.cellSize)
    grid.rows = Math.floor(p.height / grid.cellSize)
    clusteringDistance = Math.floor(grid.cols / 2)
    p.textFont(monospaceFont)
    p.noStroke()
    setGradient()

    const TEXT_SIZE_ADJUSTMENT = 4
    p.textSize(grid.cellSize + TEXT_SIZE_ADJUSTMENT)
    p.textAlign(p.LEFT, p.TOP)

    textAreas = setupTextAreas(textAreas)

    display()

    toggleInfoBox()
  }

  // amazonq-ignore-next-line
  function createBlock (usedIndices, clusterCenterX, clusterCenterY) {
    let randomIndex
    const availableIndices = Array.from(Array(blocks.length).keys()).filter(
      i => !usedIndices.has(i)
    )

    if (availableIndices.length === 0) {
      console.warn('All indices have been used. Resetting usedIndices.')
      usedIndices.clear()
      availableIndices.push(...Array.from(Array(blocks.length).keys()))
    }

    const randomPosition = Math.floor(Math.random() * availableIndices.length)
    randomIndex = availableIndices[randomPosition]
    usedIndices.add(randomIndex)

    let lines = blocks[randomIndex].map(line => line.replace(/ /g, fillChar))

    const width = Math.max(...lines.map(line => line.length))
    const height = lines.length

    // Generate random x and y positions within the clustering distance
    const x = Math.max(
      0,
      Math.min(
        grid.cols - width,
        clusterCenterX + Math.floor((Math.random() - 0.5) * clusteringDistance)
      )
    )
    const y = Math.max(
      0,
      Math.min(
        grid.rows - height,
        clusterCenterY + Math.floor((Math.random() - 0.5) * clusteringDistance)
      )
    )

    return {
      index: randomIndex, // Track the block's index for uniqueness
      lines: lines,
      x: x,
      y: y,
      w: width,
      h: height
    }
  }

  // change side-effects to explicit return
  function setupTextAreas (textAreas) {
    const usedIndices = new Set(textAreas.map(area => area.index)) // Track already used indices

    // Set a new cluster center for this setup
    const clusterCenterX = Math.floor(Math.random() * grid.cols)
    const clusterCenterY = Math.floor(Math.random() * grid.rows)

    const newTextAreas = [...textAreas]
    const blocksToAdd = blockCount - newTextAreas.length
    if (blocksToAdd > 0) {
      const newBlocks = Array(blocksToAdd)
        .fill()
        .map(() => createBlock(usedIndices, clusterCenterX, clusterCenterY))
      newTextAreas.push(...newBlocks)
    }

    return newTextAreas
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
    drawDraggingHighlight()
    drawTextAreas()
  }

  const drawDraggingHighlight = () => {
    if (dragging) {
      const hue = calculateHue()
      const saturation = 50
      const brightness = 100
      const alpha = 100

      p.colorMode(p.HSB)
      p.fill(hue, saturation, brightness, alpha)

      drawHighlightRectangle()

      p.colorMode(p.RGB)
      p.fill(0)
    }
    p.fill(0)
  }

  const calculateHue = () => {
    const MIN_HUE = 240 // Blue
    const MAX_HUE = 60 // Yellow
    const HUE_RANGE = MAX_HUE - MIN_HUE
    return (
      MAX_HUE - ((selectedIndex * (HUE_RANGE / textAreas.length)) % HUE_RANGE)
    )
  }

  const drawHighlightRectangle = () => {
    const area = textAreas[selectedIndex]
    p.rect(
      area.x * grid.cellSize,
      area.y * grid.cellSize,
      area.w * grid.cellSize,
      area.h * grid.cellSize
    )
  }

  let cachedCharGrid = null

  const drawTextAreas = () => {
    if (!cachedCharGrid) {
      cachedCharGrid = createCharGrid()
    }
    populateCharGrid(cachedCharGrid)
    renderCharGrid(cachedCharGrid)
  }

  const createCharGrid = () => {
    return Array(grid.rows)
      .fill()
      .map(() => Array(grid.cols).fill(fillChar))
  }

  const populateCharGrid = charGrid => {
    // Reset the grid
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        charGrid[y][x] = fillChar
      }
    }

    for (let area of textAreas) {
      for (let i = 0; i < area.lines.length; i++) {
        const line = area.lines[i]
        for (let j = 0; j < line.length; j++) {
          if (line[j] === fillChar) continue

          if (
            withinGrid(area, i, j) &&
            charGrid[area.y + i][area.x + j] === fillChar &&
            line[j] !== ' '
          ) {
            try {
              charGrid[area.y + i][area.x + j] = line[j]
            } catch (error) {
              console.error(
                `Error at position (${area.x + j}, ${area.y + i}):`,
                error
              )
              // Skip this iteration and continue with the next character
              continue
            }
          }
        }
      }
    }
  }

  const renderCharGrid = charGrid => {
    for (let y = 0; y < charGrid.length; y++) {
      for (let x = 0; x < charGrid[y].length; x++) {
        const canvasX = x * grid.cellSize
        const canvasY = y * grid.cellSize
        p.text(charGrid[y][x], canvasX, canvasY)
      }
    }
  }

  const withinGrid = (area, i, j) => {
    return (
      area.y + i >= 0 &&
      area.y + i < grid.rows &&
      area.x + j >= 0 &&
      area.x + j < grid.cols
    )
  }

  function isClickOnInfoBox (element) {
    const rect = element.getBoundingClientRect()
    return (
      p.mouseX >= rect.left &&
      p.mouseX <= rect.right &&
      p.mouseY >= rect.top &&
      p.mouseY <= rect.bottom
    )
  }

  p.draw = () => {
    if (!dragging) return
    display()
  }

  p.mousePressed = () => {
    if (isClickOnInfoBox(infoBox)) {
      return false // Prevents p5js from handling this event
    }
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
    if (isClickOnInfoBox(infoBox)) {
      return false // Prevents p5js from handling this event
    }
    if (dragging) {
      let area = textAreas[selectedIndex]
      // Convert mouse position to grid coordinates directly
      area.x = Math.floor((p.mouseX - offsetX) / grid.cellSize)
      area.y = Math.floor((p.mouseY - offsetY) / grid.cellSize)
    }
  }

  p.mouseReleased = () => {
    dragging = false
    display() // to remove the highlight
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    setGradient() // Recreate the gradient when the window is resized
  }

  p.keyPressed = async () => {
    if (p.key === 'i' || p.keyCode === p.ESCAPE) {
      toggleInfoBox()
    } else if (p.key === ' ') {
      fillChar = fillChars[(fillChars.indexOf(fillChar) + 1) % fillChars.length]
      display()
    } else if (p.key === 'r') {
      // Clear and replace text areas
      textAreas.length = 0
      textAreas = setupTextAreas(textAreas) // Reinitialize with new unique blocks
      display()
    } else if (p.keyCode === p.RIGHT_ARROW) {
      // Add a new block
      if (textAreas.length < blocks.length) {
        const usedIndices = new Set(textAreas.map(area => area.index)) // Track used indices
        textAreas.push(createBlock(usedIndices))
        blockCount++
        display()
      }
    } else if (p.keyCode === p.LEFT_ARROW) {
      // Remove the last block (minimum of 1 block)
      if (textAreas.length > 1) {
        textAreas.pop()
        blockCount--
        display()
      }
    } else if (p.key === 'n') {
      // Request another query to tumblrRandomPost using initializeBlocks
      try {
        await initializeBlocks()
        textAreas.length = 0
        textAreas = setupTextAreas(textAreas) // Reinitialize with new unique blocks
        display()
      } catch (error) {
        console.error(
          'Failed to fetch or process new data from tumblrRandomPost.',
          error
        )
      }
    }

    // NOTE: down increases / up decreases
    // because lower text index has priority in display
    if (!dragging || selectedIndex === -1) return

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
        display()
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
        display()
      }
    }
  }
})
