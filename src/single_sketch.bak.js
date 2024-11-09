import '../css/style.css';
await import('p5js-wrapper')
import { textBlocks } from './textblocks.js';

new p5(p => {

  let textAreas = [];
  let dragging = false;
  let dragIndex = -1;
  let offsetX, offsetY;
  let gradient;
  let charGrid = {}
  const gridSize = 15; // Assuming the font size is 24

  const testBlock = `
1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 
1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 `;

  p.preload = function () {
    // Load a monospace font
    p.font = p.loadFont("./saxmono.ttf");
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    setGradient();

    p.textSize(gridSize + 4);
    p.textAlign(p.LEFT, p.TOP);
    p.textFont(p.font); // Set the font to the loaded monospace font

    // Select 3 random text blocks
    let selectedTextBlocks = [];
    while (selectedTextBlocks.length < 6) {
      let randomIndex = Math.floor(Math.random() * textBlocks.length);
      selectedTextBlocks.push(textBlocks[randomIndex]);
    }

    // Define text areas with random grid-aligned positions
    for (let text of selectedTextBlocks) {
      let lines = text.split("\n");
      textAreas.push({
        lines: lines,
        x: getRandomGridPosition(p.width / 2),
        y: getRandomGridPosition(p.height / 2),
        w: Math.max(...lines.map((line) => p.textWidth(line))),
        h: lines.length * gridSize,
      });
    }

    display()
  };

  const setGradient = () => {
    gradient = p.drawingContext.createLinearGradient(0, 0, p.width, 0);
    gradient.addColorStop(0, "#f8b500");
    gradient.addColorStop(1, "#fceabb");
  };
  
  function drawGradient() {
    // Apply the gradient to the canvas
    p.drawingContext.fillStyle = gradient;
    p.drawingContext.fillRect(0, 0, p.width, p.height);
  }

  const display = () => {
    drawGradient();
    charGrid = {};
    // renders text to a grid
    // THEN draw th grid (no overlaps)

    // well, this isn't rendering to grid, but at least it is tracking no overlaps
    // next step is really using a grid
    // this will allow for first/last overlays decisions
    // would also like to change "level" of a given text, to assert primacy of display
    // and outline (?) of text when dragging?
    
    // Draw text areas
    for (let area of textAreas) {
      for (let i = 0; i < area.lines.length; i++) {
        const line = area.lines[i];
        for (let j = 0; j < line.length; j++) {
          const key = `${area.x + j * gridSize},${area.y + i * gridSize}`
          if (line[j] === ' ' || charGrid[key]) {
            continue;
          } else {
            charGrid[key] = line[j];
          }
          p.text(line[j], area.x + j * gridSize, area.y + i * gridSize);
        }
      }
    }
  }

  p.draw = () => {
    if (!dragging) return
    display()
  };

  p.mousePressed = () => {
    for (let i = 0; i < textAreas.length; i++) {
      let area = textAreas[i];
      if (
        p.mouseX > area.x &&
        p.mouseX < area.x + area.w &&
        p.mouseY > area.y &&
        p.mouseY < area.y + area.h
      ) {
        dragging = true;
        dragIndex = i;
        offsetX = p.mouseX - area.x;
        offsetY = p.mouseY - area.y;
        break;
      }
    }
  };

  p.mouseDragged = () => {
    if (dragging) {
      let area = textAreas[dragIndex];
      area.x = Math.round((p.mouseX - offsetX) / gridSize) * gridSize;
      area.y = Math.round((p.mouseY - offsetY) / gridSize) * gridSize;
    }
  };

  p.mouseReleased = () => {
    dragging = false;
    dragIndex = -1;
  };

  function getRandomGridPosition(max) {
    return Math.floor(Math.random() * (max / gridSize)) * gridSize;
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    setGradient(); // Recreate the gradient when the window is resized
  };

})