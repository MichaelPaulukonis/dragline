const gridSize = 40;
const FILLER = ' '
let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(FILLER)); // Initialize a 30x30 grid with spaces
// import tumblrRandom from '../src/tumblr-random.js';
// const result = await tumblrRandom();
import blocks from '../src/blocks.json' assert { type: 'json' };
import tumbled from './sample.tumble.js'

// Function to check if a string can be placed at a specific position horizontally
function canPlaceString(str, row, col) {
  if (col + str.length > gridSize) return false; // Check if string goes out of bounds
  for (let i = 0; i < str.length; i++) {
    if (grid[row][col + i] !== FILLER && grid[row][col + i] !== str[i]) return false; // Check for non-matching letter
  }
  return true; // The string can be placed
}

// Function to place the string in the grid horizontally
function placeString(str, row, col) {
  for (let i = 0; i < str.length; i++) {
    grid[row][col + i] = str[i];
  }
}

function canPlaceSegment(segment, row, col, vertical) {
    if (vertical) {
      // Check if the segment fits vertically
      if (row + segment.length > gridSize) return false; // Out of bounds
      for (let i = 0; i < segment.length; i++) {
        if (grid[row + i][col] !== FILLER) return false; // Cell is not empty
      }
    } else {
      // Check if the segment fits horizontally
      if (col + segment.length > gridSize) return false; // Out of bounds
      for (let i = 0; i < segment.length; i++) {
        if (grid[row][col + i] !== FILLER) return false; // Cell is not empty
      }
    }
    return true; // Segment fits
  }
  
  function placeSegment(segment, row, col, vertical) {
    if (vertical) {
      // Place the segment vertically
      for (let i = 0; i < segment.length; i++) {
        grid[row + i][col] = segment[i];
      }
    } else {
      // Place the segment horizontally
      for (let i = 0; i < segment.length; i++) {
        grid[row][col + i] = segment[i];
      }
    }
  }

// Function to find a place for the string, splitting on spaces if necessary
function findPlaceForString(str) {
  let words = str.replace(/\s+/g, ' ').split(' ');
  let row = 0;
  let col = 0;
  const maxLineLength = Math.floor(gridSize / 2); // 50% of the grid width

  for (let word of words) {
    if (col + word.length > maxLineLength) {
      row++;
      col = 0;
      if (row >= gridSize) return false; // No place found for the string
    }
    while (!canPlaceString(word, row, col)) {
      row++;
      col = 0;
      if (row >= gridSize) return false; // No place found for the string
    }
    placeString(word, row, col);
    col += word.length + 1; // Move to the next position, leaving a space
  }
  return true; // Successfully placed the string
}

function printGrid(grid) {
    for (let row of grid) {
        console.log(row.join(''));
    }
    
}
// Example usage
// findPlaceForString("HELLO");

// // printGrid(grid)

// findPlaceForString("Hamstrings");
// findPlaceForString("Night has fallen");
// findPlaceForString("The quick brown fox jumps over the lazy dog");

const cleanLine = (line) => line.replace(/\s+/g, ' ')


// re-implement for findPlaceForString - so text is not one long line but kept together
for (let i = 0; i < 40; i++) {
    let block = blocks[Math.floor(Math.random() * blocks.length)];
    let line = cleanLine(block[Math.floor(Math.random() * block.length)])
    let vertical = Math.random() > 0.8; // Randomly decide if the segment is vertical
    let row = Math.floor(Math.random() * gridSize);
    let col = Math.floor(Math.random() * (gridSize - 10));
    if (!canPlaceSegment(line, row, col, vertical)) {
      console.log('Cannot place segment at', row, col);
      continue
    }
    placeSegment(line, row, col, vertical);

}

printGrid(grid)