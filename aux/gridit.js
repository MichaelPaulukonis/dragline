const gridSize = 20
const FILLER = '.'
let grid = Array(gridSize)
  .fill()
  .map(() => Array(gridSize).fill(FILLER)) // Initialize grid
// import tumblrRandom from '../src/tumblr-random.js';
// const result = await tumblrRandom();
// import blocks from '../src/blocks.json' assert { type: 'json' }
const blocks = require('../src/blocks.json')
const tumbled = require('./sample.tumble.js')

const cleanLine = line => line.replace(/\s+/g, ' ')

function getRandomElement(array) {
  const idx = Math.floor(Math.random() * array.length)
  // amazonq-ignore-next-line
  console.log(array.length, idx, array[idx])
  return array[idx];
}

function printGrid (grid) {
  for (let row of grid) {
    console.log(row.join(''))
  }
}

function canPlaceSegment (segment, row, col, vertical = false) {
  if (vertical) {
    // Check if the segment fits vertically
    if (row + segment.length > gridSize) return false // Out of bounds
    for (let i = 0; i < segment.length; i++) {
      if (grid[row + i][col] !== FILLER) return false // Cell is not empty
    }
  } else {
    // Check if the segment fits horizontally
    if (col + segment.length > gridSize) return false // Out of bounds
    for (let i = 0; i < segment.length; i++) {
      if (grid[row][col + i] !== FILLER) return false // Cell is not empty
    }
  }
  return true // Segment fits
}

function placeSegment (segment, row, col, vertical = false) {
  if (vertical) {
    // Place the segment vertically
    for (let i = 0; i < segment.length; i++) {
      grid[row + i][col] = segment[i]
    }
  } else {
    // Place the segment horizontally
    for (let i = 0; i < segment.length; i++) {
      grid[row][col + i] = segment[i]
    }
  }
}

const maxLineLength = Math.floor(gridSize / 2) // 50% of the grid width

// Function to find a place for the string, splitting on spaces if necessary
function findPlaceForString (words) {
  // let words = cleanLine(str).split(/\s+/)
  let row = Math.floor(Math.random() * gridSize)
  let col = Math.floor(Math.random() * (gridSize - 10))
  let vertical = Math.random() > 0.8 // Randomly decide if the segment is vertical

  for (let word of words) {
    if (col + word.length > maxLineLength) {
      row++
      col = 0
      if (row >= gridSize) return false // No place found for the string
    }
    while (!canPlaceSegment(word, row, col, vertical)) {
      row++
      col = 0
      if (row >= gridSize) return false // No place found for the string
    }
    placeSegment(word, row, col, vertical)
    col += word.length + 1 // Move to the next position, leaving a space
  }
  return true // Successfully placed the string
}


function splitRandomly (array, numChunks) {
  const total = array.length
  const minSize = Math.floor(total / numChunks)
  let remaining = total
  let chunks = []

  for (let i = 0; i < numChunks - 1; i++) {
    // Random size between minSize and remaining - (numChunks-i-1)*minSize
    const maxExtra = remaining - (numChunks - i - 1) * minSize
    const size = minSize + Math.floor(Math.random() * (maxExtra - minSize + 1))
    chunks.push(
      array.slice(
        chunks.reduce((acc, c) => acc + c.length, 0),
        chunks.reduce((acc, c) => acc + c.length, 0) + size
      )
    )
    remaining -= size
  }

  // Add remaining elements to last chunk
  chunks.push(array.slice(chunks.reduce((acc, c) => acc + c.length, 0)))

  return chunks
}

// Example usage
// findPlaceForString("HELLO");

// // printGrid(grid)

// findPlaceForString("Hamstrings");
// findPlaceForString("Night has fallen");
// findPlaceForString("The quick brown fox jumps over the lazy dog");

// // re-implement for findPlaceForString - so text is not one long line but kept together

const blockify = () => {
  for (let i = 0; i < 40; i++) {
    let block = blocks[Math.floor(Math.random() * blocks.length)]
    let line = cleanLine(block[Math.floor(Math.random() * block.length)])
    let vertical = Math.random() > 0.8 // Randomly decide if the segment is vertical
    let row = Math.floor(Math.random() * gridSize)
    let col = Math.floor(Math.random() * (gridSize - 10))
    if (!canPlaceSegment(line, row, col, vertical)) {
      console.log('Cannot place segment at', row, col)
      continue
    }
    placeSegment(line, row, col, vertical)
  }
}

const numChunks = getRandomElement([3,5,7])
console.log(tumbled.default)
let words = getRandomElement(tumbled.default).split(/\s+/)
const chunks = splitRandomly(words, numChunks)

for (let chunk of chunks) {
  console.log(chunk.join('+'))
  let success = false
  let attempts = 0
  let maxAttempts = 5
  while (!success && attempts < maxAttempts) {
    success = findPlaceForString(chunk)
    attempts++
  }
}

printGrid(grid)
