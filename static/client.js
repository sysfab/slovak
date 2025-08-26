const socket = io();

let currentRow = 0;
let currentCol = 0;
let isRowLocked = false;

const maxAttempts = 10;
const wordLength = 6;

function initBoard() {
  const board = document.getElementById("board");
  for (let r = 0; r < maxAttempts; r++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let c = 0; c < wordLength; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function handleKeyPress(e) {
  if (currentRow >= maxAttempts || isRowLocked) return;

  if (e.key === "Enter") {
    submitGuess();
  } else if (e.key === "Backspace") {
    deleteLetter();
  } else if (/^[a-zA-ZА-ЩЬЮЯҐЄІЇа-щьюяґєії]$/.test(e.key)) {
    addLetter(e.key.toUpperCase());
  }
}

function addLetter(letter) {
  if (currentCol < wordLength) {
    const row = document.getElementById("board").children[currentRow];
    const tile = row.children[currentCol];
    tile.textContent = letter;
    currentCol++;
    tile.textContent = letter;
    tile.classList.add("type");
    setTimeout(() => tile.classList.remove("type"), 100);
  }
}

function deleteLetter() {
  if (currentCol > 0) {
    currentCol--;
    const row = document.getElementById("board").children[currentRow];
    const tile = row.children[currentCol];
    tile.textContent = "";
  }
}

function submitGuess() {
  if (currentCol < wordLength) {
    return;
  }

  isRowLocked = true;

  const row = document.getElementById("board").children[currentRow];
  let guess = "";
  for (let i = 0; i < wordLength; i++) {
    guess += row.children[i].textContent;
  }

  socket.emit("guess", { word: guess });
}

socket.on("guess_feedback", (data) => {
    if (data.correct === 0) {
        isRowLocked = false;
        return;
    }

    updateBoard(data.guess, data.feedback, data.word);
});

function updateBoard(word, feedback, targetWord) {
  const board = document.getElementById("board");
  const row = board.children[currentRow];

  for (let i = 0; i < wordLength; i++) {
    const tile = row.children[i];
    tile.textContent = word[i];

    setTimeout(() => {
      tile.classList.add("flip");

      setTimeout(() => {
        if (feedback[i] === 2) {
          tile.classList.add("correct");
        } else if (feedback[i] === 1) {
          tile.classList.add("present");
        } else {
          tile.classList.add("absent");
        }
      }, 250);
    }, i * 250);
  }

  setTimeout(() => {
    // Check if won
    if (word === targetWord) {
      showPopup(`🎉 Ти вгадав! Слово: "${targetWord.toUpperCase()}"`);
      return;
    }

    currentRow++;
    currentCol = 0;
    isRowLocked = false;

    // Check if lost
    if (currentRow >= maxAttempts) {
      showPopup(`😢 Ти не вгадав! Слово: "${targetWord.toUpperCase()}"`);
    }
  }, wordLength * 500);
}

function showPopup(message) {
  const popup = document.getElementById("game-over-popup");
  document.getElementById("popup-message").textContent = message;
  popup.classList.remove("hidden");
}

// Initialize grid and key listeners
initBoard();
document.addEventListener("keydown", handleKeyPress);
