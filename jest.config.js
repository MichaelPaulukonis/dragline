export default {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testEnvironment: "node", // Explicitly set the test environment to "node"
  testSequencer: "@jest/test-sequencer" // Explicitly set the test sequencer
};