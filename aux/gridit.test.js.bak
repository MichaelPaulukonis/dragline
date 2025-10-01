// npm install --save-dev jest
// npx jest

const { canPlaceString, placeString, findPlaceForString, printGrid, grid, gridSize, FILLER } = require('./gridit');

describe('Grid Placement Functions', () => {
  beforeEach(() => {
    // Reset the grid before each test
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        grid[row][col] = FILLER;
      }
    }
  });

  test('canPlaceString should return true for valid placement', () => {
    expect(canPlaceString('HELLO', 0, 0)).toBe(true);
  });

  test('canPlaceString should return false for out of bounds placement', () => {
    expect(canPlaceString('HELLO', 0, gridSize - 2)).toBe(false);
  });

  test('placeString should correctly place a string in the grid', () => {
    placeString('HELLO', 0, 0);
    expect(grid[0].slice(0, 5)).toEqual(['H', 'E', 'L', 'L', 'O']);
  });

  test('findPlaceForString should place a string in the grid', () => {
    findPlaceForString('HELLO');
    expect(grid[0].slice(0, 5)).toEqual(['H', 'E', 'L', 'L', 'O']);
  });

  test('findPlaceForString should handle strings that need to be split', () => {
    findPlaceForString('The quick brown fox jumps over the lazy dog');
    expect(grid[0].slice(0, 3)).toEqual(['T', 'h', 'e']);
    expect(grid[1].slice(0, 5)).toEqual(['q', 'u', 'i', 'c', 'k']);
  });

  test('findPlaceForString should handle long words by moving them to the next line', () => {
    findPlaceForString('Supercalifragilisticexpialidocious');
    expect(grid[0].slice(0, 15)).toEqual('Supercalifragil'.split(''));
    expect(grid[1].slice(0, 15)).toEqual('isticexpialidoc'.split(''));
  });

  test('printGrid should print the grid correctly', () => {
    console.log = jest.fn();
    findPlaceForString('HELLO');
    printGrid(grid);
    expect(console.log).toHaveBeenCalledWith('HELLO.............................');
  });
});