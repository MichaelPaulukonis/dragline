import fs from 'fs';
import path from 'path';
import { tokenize } from './tokenizer.js';
import { buildGrid } from './gridBuilder.js';
import { splitGrid } from './splitter.js';

// const sampleFilePath = path.join(__dirname, '../aux/sample.tumble.js');
const sampleFilePath = '../aux/sample.tumble.js'


// Read the sample text file
fs.readFile(sampleFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the sample file:', err);
        return;
    }

    // Tokenize the text
    const tokens = tokenize(data);

    // console.log('Tokens:', tokens);

    // Build a 40x40 grid with the tokens
    const grids = buildGrid(tokens, 0.5);

    console.log('Generated 40x40 grids: ', grids.length);

    // Split the grid into four 20x20 grids
    const smallerGrids = grids.map(splitGrid).flat(); // Flatten in case multiple grids were generated
    if (smallerGrids.length === 0) {
        console.error('No smaller grids generated.');
        return;
    }
    // Log the number of smaller grids generated
    console.log(`Generated ${smallerGrids.length} smaller 20x20 grids.`);
    const timestamp = () => new Date().toISOString().replace(/[-:.]/g, '');
    fs.writeFileSync(`grids.${timestamp()}.json`, JSON.stringify(smallerGrids, null, 2), 'utf8')
});