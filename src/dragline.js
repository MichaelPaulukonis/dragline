import '../css/style.css'
await import('p5js-wrapper')
import gridify from './text-grid'
import { createCharGrid, populateCharGrid, renderCharGrid } from './grid'
import { createBlock, setupTextAreas } from './blocks'
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
    grid.cols = Math.floor(p.width / grid.cellSize)
    grid.rows = Math.floor(p.height / grid.cellSize)
    clusteringDistance = Math.floor(grid.cols / 2)
    p.textFont(monospaceFont)
    p.noStroke()
    setGradient()

    const TEXT_SIZE_ADJUSTMENT = 4
    p.textSize(grid.cellSize + TEXT_SIZE_ADJUSTMENT)
    p.textAlign(p.LEFT, p.TOP)

    textAreas = setupTextAreas(textAreas, blocks, blockCount, grid, fillChar, clusteringDistance)

    display()

    toggleInfoBox()
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
      cachedCharGrid = createCharGrid(grid.rows, grid.cols, fillChar)
    }
    populateCharGrid(cachedCharGrid, textAreas, fillChar, withinGrid)
    renderCharGrid(cachedCharGrid, p, grid, fillChar)
  }

  const withinGrid = (area, i, j) => {
    return (
      area.y + i >= 0 &&
      area.y + i < grid.rows &&
      area.x + j >= 0 &&
      area.x + j < grid.cols
    )
  }

  function isClickOnInfoBox(element) {
    const rect = element.getBoundingClientRect()
    return (
      p.mouseX >= rect.left &&
      p.mouseX <= rect.right &&
      p.mouseY >= rect.top &&
      p.mouseY <= rect.bottom
    )
  }

  p.mousePressed = () => {
    if (isClickOnInfoBox(infoBox)) {
      return false // Prevents p5js from handling this event
    }

    let blockClicked = false
    for (let i = 0; i < textAreas.length; i++) {
      const area = textAreas[i]
      // Calculate block boundaries in pixels
      const pixelX = area.x * grid.cellSize
      const pixelY = area.y * grid.cellSize
      const pixelW = area.w * grid.cellSize
      const pixelH = area.h * grid.cellSize

      // Check if the mouse click is within the block's boundaries
      if (
        p.mouseX >= pixelX &&
        p.mouseX < pixelX + pixelW && // Use `<` instead of `<=` for proper boundary handling
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

    display() // Ensure the display updates to reflect selection changes
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
      display() // Update the display while dragging
    }
  }

  p.mouseReleased = () => {
    dragging = false
    display() // to remove the highlight
  }

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

  function cycleFillChar() {
    fillChar = fillChars[(fillChars.indexOf(fillChar) + 1) % fillChars.length]
    display()
  }

  function resetTextAreas() {
    textAreas.length = 0
    textAreas = setupTextAreas(textAreas, blocks, blockCount, grid, fillChar, clusteringDistance)
    display()
  }

  function addBlock() {
    if (textAreas.length < blocks.length) {
      const usedIndices = new Set(textAreas.map(area => area.index))
      textAreas.push(createBlock(usedIndices, Math.floor(grid.cols / 2), Math.floor(grid.rows / 2), blocks, fillChar, clusteringDistance, grid))
      blockCount++
      display()
    }
  }

  function removeBlock() {
    if (textAreas.length > 1) {
      textAreas.pop()
      blockCount--
      display()
    }
  }

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
