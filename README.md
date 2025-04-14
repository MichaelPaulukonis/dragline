# dragline

An experimental text display using HTML canvas to bypass rendering differences in browsers.

TBH this "solves" a problem that has bothered me for over a decade - draggable, perfectly aligned (monospaced) text. Not really sure why I never considered the canvas until now.

It's not so much a tool as it is a piece of its own.

## TODO

- ~~connect to tumblr for text for now~~
- save screen ?
  - without the background
  - click-drag for a defined area to use a canvas?
- ability to remove specific block (DEL while selected)
  - tricky. Maybe have a "SELECT" mode, where we move from area to area with keys
  - this would make up/down easier to deal with
  - and we could "replace" the individual block
  - or clone it (why would we WANT to ????)
  - or edit (uuhmmmmmmm)
- auto-movement?
  - this may be a separate project
- better clustering
- display of all blocks

## text sources

- The poetry-bot may be too esoteric
- https://newsdata.io/pricing 200 requests per dat/ 10 articles per request for free
- https://www.gutenberg.org/ for public domain books
- https://pypi.org/project/Gutenberg/
- https://github.com/jpmulligan/random-gutenberg
- https://github.com/public-api-lists/public-api-lists
