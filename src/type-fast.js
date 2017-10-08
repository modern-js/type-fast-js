const player = require('./player.js');
const termkit = require('terminal-kit');
const screen = require('./screen-text.js');
const cloptions = require('./cl-options.js');

const term = termkit.terminal;

const encouragement = ['Good!', 'Nice!', 'Doing great!', 'Awesome!', 'Keep it up!'];

let viewport = {};

function terminate() {
  term.hideCursor(false);
  term.grabInput(false);

  setTimeout(() => {
    term.moveTo(1, term.height, '\n\n');
    term.clear();
    process.exit();
  }, 100);
}

function regHitOnScreen() {
  term.nextLine(1).eraseLine();
  term.nextLine(2).cyan(`${encouragement[screen.getRandomInt(0, encouragement.length)]}`).eraseLineAfter();
}

function inpWord(key) {
  switch (key) {
    case 'BACKSPACE':
      // Remove the last char from the screen.
      term.nextLine(1).right(player.inpWord.length - 1).cyan(' ');

      // Remove the last char at the first positon of the player inpWord string.
      if (player.inpWord.length === 1) {
        term.left(2).cyan(' ');
      }

      player.inpWord = player.inpWord.slice(0, player.inpWord.length - 1);
      break;

    case 'CTRL_C':
      player.updateStats();
      player.save();
      terminate();
      break;

    case 'ENTER':
    case ' ':
      // All of the words from the list are at least 5 chars long,
      // this avoids premature checking.
      if (player.inpWord.length > 4 && screen.foundMatchOnScreen(viewport)) {
        regHitOnScreen();
      }
      break;

    default:
      player.inpWord += key;
      term.cyan(player.inpWord);
      break;
  }
}

function init(callback) {
  termkit.getDetectedTerminal((error) => {
    if (error) {
      throw new Error('Cannot detect terminal!');
    }

    viewport = screen.screenBuffer.create({
      dst: term,
      width: Math.min(term.width) * 4,
      height: Math.min(term.height - 5),
      y: 2,
    });

    screen.createScreenText(viewport);
    screen.putWordsOffScreen();

    term.hideCursor();
    term.grabInput();
    term.on('key', inpWord);

    callback();
  });
}

function draw() {
  screen.draw(viewport);
  viewport.draw();
}

function animate() {
  draw();
  screen.moveScreenTextLeft();
  setTimeout(animate, 10);
}

init(() => {
  animate();
});