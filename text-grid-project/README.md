# Text Grid Project

This project is designed to ingest text data, tokenize it, and create visual representations in the form of grids. The main functionalities include tokenization of text, building a 40x40 grid with random spacing between tokens, and splitting this grid into four 20x20 grids.

## Project Structure

```
text-grid-project
├── src
│   ├── index.js          # Entry point of the application
│   ├── tokenizer.js      # Tokenization logic
│   ├── gridBuilder.js    # Logic for building grids
│   ├── splitter.js       # Logic for splitting grids
│   └── utils
│       └── helpers.js    # Utility functions
├── aux
│   └── sample.tumble.js  # Sample text data
├── package.json          # NPM configuration
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd text-grid-project
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

## Usage

- The application will read from `aux/sample.tumble.js`, tokenize the text, and generate a 40x40 grid.
- The grid will be split into four 20x20 grids, which can be used for further processing or visualization.

## Example

After running the application, you can expect to see the generated grids in the console or as output files, depending on the implementation in `src/index.js`.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.