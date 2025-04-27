import '../css/style.css'
await import('p5js-wrapper')
import gridify from './text-grid'
import { createCharGrid, populateCharGrid, renderCharGrid } from './grid'
import { createBlock, setupTextAreas } from './blocks'
const fallbackBlocks = await import('./grids.20250403T123247766Z.json')
import tumblrRandomPost from './tumblr-random'

let corpus
let blocks

// Initialize blocks by fetching data from Tumblr or falling back to a local JSON file
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

// Main p5.js instance
new p5(p => {
  let textAreas = [] // Array to store text blocks
  let dragging = false // Flag to track dragging state
  let selectedIndex = -1 // Index of the currently selected block
  let blockCount = 10 // Initial number of blocks
  let clusteringDistance = 5 // Controls clustering tightness

  let offsetX, offsetY // Offset for dragging
  let gradient // Gradient for the background
  let grid = {
    cols: 0,
    rows: 0,
    cellSize: 15 // Size of each grid cell
  }
  let fillChars = ' .-|:*+' // Characters used for filling text blocks
  let fillChar = fillChars[0] // Default fill character
  let monospaceFont = null // Font for rendering text

  // DOM elements for the info box
  const infoBox = document.getElementById('info-box')
  const closeButton = document.getElementById('close-info-box')

  // Toggle the visibility of the info box
  const toggleInfoBox = () => {
    infoBox.classList.toggle('hidden') // Simplify logic with toggle
  }

  closeButton.addEventListener('click', () => {
    toggleInfoBox()
  })

  // Preload assets (e.g., fonts)
  p.preload = function () {
    monospaceFont = p.loadFont('saxmono.ttf')
  }

  // Setup the canvas and initialize the grid and text areas
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    grid.cols = Math.floor(p.width / grid.cellSize)
    grid.rows = Math.floor(p.height / grid.cellSize)
    clusteringDistance = Math.floor(grid.cols / 2) // Cache this value
    p.textFont(monospaceFont)
    p.noStroke()
    setGradient()

    const TEXT_SIZE_ADJUSTMENT = 4
    const textSize = grid.cellSize + TEXT_SIZE_ADJUSTMENT // Cache this value
    p.textSize(textSize)
    p.textAlign(p.LEFT, p.TOP)

    textAreas = setupTextAreas(textAreas, blocks, blockCount, grid, fillChar, clusteringDistance)

    display()

    toggleInfoBox()
  }

  // Create a gradient for the background
  const setGradient = () => {
    gradient = p.drawingContext.createLinearGradient(0, 0, p.width, 0)
    gradient.addColorStop(0, '#f8b500')
    gradient.addColorStop(1, '#fceabb')
  }

  // Draw the gradient background
  function drawGradient () {
    p.drawingContext.fillStyle = gradient
    p.drawingContext.fillRect(0, 0, p.width, p.height)
  }

  // Main display function to render the canvas
  const display = () => {
    drawGradient()
    drawDraggingHighlight()
    drawTextAreas()
  }

  // Highlight the selected block while dragging
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
    }
    p.fill(0) // Remove redundant p.fill(0)
  }

  // Calculate the hue for the dragging highlight
  const calculateHue = () => {
    const MIN_HUE = 240 // Blue
    const MAX_HUE = 60 // Yellow
    const HUE_RANGE = MAX_HUE - MIN_HUE
    return (
      MAX_HUE - ((selectedIndex * (HUE_RANGE / textAreas.length)) % HUE_RANGE)
    )
  }

  // Draw a rectangle around the selected block
  const drawHighlightRectangle = () => {
    const area = textAreas[selectedIndex]
    p.rect(
      area.x * grid.cellSize,
      area.y * grid.cellSize,
      area.w * grid.cellSize,
      area.h * grid.cellSize
    )
  }

  let cachedCharGrid = null // Cache for the character grid

  // Draw all text areas on the canvas
  const drawTextAreas = () => {
    if (!cachedCharGrid) {
      cachedCharGrid = createCharGrid(grid.rows, grid.cols, fillChar)
    }
    populateCharGrid(cachedCharGrid, textAreas, fillChar, withinGrid)
    renderCharGrid(cachedCharGrid, p, grid, fillChar)
  }

  // Check if a position is within the grid boundaries
  const withinGrid = (area, i, j) => {
    return (
      area.y + i >= 0 &&
      area.y + i < grid.rows &&
      area.x + j >= 0 &&
      area.x + j < grid.cols
    )
  }

  // Check if the mouse click is on the info box
  function isClickOnInfoBox(element) {
    const rect = element.getBoundingClientRect()
    return (
      p.mouseX >= rect.left &&
      p.mouseX <= rect.right &&
      p.mouseY >= rect.top &&
      p.mouseY <= rect.bottom
    )
  }

  // Handle mouse press events
  p.mousePressed = () => {
    if (isClickOnInfoBox(infoBox)) {
      return false // Prevents p5js from handling this event
    }

    let blockClicked = false
    for (let i = 0; i < textAreas.length; i++) {
      const area = textAreas[i]
      const pixelX = area.x * grid.cellSize
      const pixelY = area.y * grid.cellSize
      const pixelW = area.w * grid.cellSize
      const pixelH = area.h * grid.cellSize

      if (
        p.mouseX >= pixelX &&
        p.mouseX < pixelX + pixelW &&
        p.mouseY >= pixelY &&
        p.mouseY < pixelY + pixelH
      ) {
        dragging = true
        selectedIndex = i
        offsetX = p.mouseX - pixelX
        offsetY = p.mouseY - pixelY
        blockClicked = true
        break
      }
    }

    if (!blockClicked) {
      selectedIndex = -1 // Deselect if no block is clicked
    }

    display() // Update the display
  }

  // Handle mouse drag events
  p.mouseDragged = () => {
    if (isClickOnInfoBox(infoBox)) {
      return false // Prevents p5js from handling this event
    }
    if (dragging) {
      let area = textAreas[selectedIndex]
      area.x = Math.floor((p.mouseX - offsetX) / grid.cellSize)
      area.y = Math.floor((p.mouseY - offsetY) / grid.cellSize)
      display() // Update the display while dragging
    }
  }

  // Handle mouse release events
  p.mouseReleased = () => {
    dragging = false
    display() // Remove the highlight
  }

  // Handle key press events
  p.keyPressed = async () => {
    if (p.key === 'i' || p.keyCode === p.ESCAPE) {
      toggleInfoBox()
    } else if (p.key === ' ') {
      cycleFillChar()
    } else if (p.key === 'r') {
      resetTextAreas()
    } else if (p.keyCode === p.RIGHT_ARROW && selectedIndex === -1) {
      addBlock()
    } else if (p.keyCode === p.LEFT_ARROW && selectedIndex === -1) {
      removeBlock()
    } else if (selectedIndex !== -1) {
      handleArrowKeys()
    } else if (p.key === 'n') {
      await fetchNewBlocks()
    }
  }

  // Cycle through fill characters
  function cycleFillChar() {
    fillChar = fillChars[(fillChars.indexOf(fillChar) + 1) % fillChars.length]
    display()
  }

  // Reset text areas
  function resetTextAreas() {
    textAreas.length = 0
    textAreas = setupTextAreas(textAreas, blocks, blockCount, grid, fillChar, clusteringDistance)
    display()
  }

  // Add a new block
  function addBlock() {
    if (textAreas.length < blocks.length) {
      const usedIndices = new Set(textAreas.map(area => area.index))
      textAreas.push(createBlock(usedIndices, Math.floor(grid.cols / 2), Math.floor(grid.rows / 2), blocks, fillChar, clusteringDistance, grid))
      blockCount++
      display()
    }
  }

  // Remove the last block
  function removeBlock() {
    if (textAreas.length > 1) {
      textAreas.pop()
      blockCount--
      display()
    }
  }

  // Handle arrow key movements
  function handleArrowKeys() {
    const area = textAreas[selectedIndex]
    if (p.keyCode === p.UP_ARROW && !p.keyIsDown(p.SHIFT)) {
      area.y = Math.max(0, area.y - 1) // Move up
    } else if (p.keyCode === p.DOWN_ARROW && !p.keyIsDown(p.SHIFT)) {
      area.y = Math.min(grid.rows - area.h, area.y + 1) // Move down
    } else if (p.keyCode === p.LEFT_ARROW) {
      area.x = Math.max(0, area.x - 1) // Move left
    } else if (p.keyCode === p.RIGHT_ARROW) {
      area.x = Math.min(grid.cols - area.w, area.x + 1) // Move right
    } else if (p.keyCode === p.UP_ARROW && p.keyIsDown(p.SHIFT)) {
      if (selectedIndex > 0) {
        [textAreas[selectedIndex], textAreas[selectedIndex - 1]] = [
          textAreas[selectedIndex - 1],
          textAreas[selectedIndex]
        ]
        selectedIndex--
      }
    } else if (p.keyCode === p.DOWN_ARROW && p.keyIsDown(p.SHIFT)) {
      if (selectedIndex < textAreas.length - 1) {
        [textAreas[selectedIndex], textAreas[selectedIndex + 1]] = [
          textAreas[selectedIndex + 1],
          textAreas[selectedIndex]
        ]
        selectedIndex++
      }
    } else if (p.keyCode === p.ENTER) {
      selectedIndex = -1 // Deselect the block
    }
    display()
  }

  // Fetch new blocks from Tumblr
  async function fetchNewBlocks() {
    try {
      await initializeBlocks()
      textAreas.length = 0
      textAreas = setupTextAreas(textAreas, blocks, blockCount, grid, fillChar, clusteringDistance)
      display()
    } catch (error) {
      console.error('Failed to fetch or process new data from tumblrRandomPost.', error)
    }
  }

  // Handle continuous key presses for movement
  p.draw = () => {
    if (selectedIndex !== -1 && !dragging) {
      const area = textAreas[selectedIndex]
      if (p.keyIsDown(p.UP_ARROW) && !p.keyIsDown(p.SHIFT)) {
        area.y = Math.max(0, area.y - 1) // Move up
      } else if (p.keyIsDown(p.DOWN_ARROW) && !p.keyIsDown(p.SHIFT)) {
        area.y = Math.min(grid.rows - area.h, area.y + 1) // Move down
      } else if (p.keyIsDown(p.LEFT_ARROW)) {
        area.x = Math.max(0, area.x - 1) // Move left
      } else if (p.keyIsDown(p.RIGHT_ARROW)) {
        area.x = Math.min(grid.cols - area.w, area.x + 1) // Move right
      }
      display() // Update the display after movement
    }
  }
})
