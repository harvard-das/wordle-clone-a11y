let wordDict = []

fetch('./dictionary.json')
  .then((response) => response.json())
  .then((data) => {
    wordDict = data
  })

const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500
const keyboard = document.querySelector("[data-keyboard]")
const alertContainer = document.querySelector("[data-alert-container]")
const guessGrid = document.querySelector("[data-guess-grid]")

const params = new URLSearchParams(document.location.search)
const paramName = 'game'
let targetWord = 'zyzgy'
let baseURL = 'https://harvard-das.github.io/wordle-clone-a11y/'

if (location.hostname !== 'harvard-das.github.io') {
  baseURL = `${location.origin}${location.pathname}`
}

if(params.get(paramName)) {
  targetWord = atob(params.get(paramName)).split(paramName)[0]
}
else {
  location.assign(`${baseURL}?${paramName}=${btoa(targetWord)}`)
}

const newGame = document.getElementById('newgame')
const newWord = document.getElementById('newword')
const inputError = document.getElementById('inputerror')

newGame.addEventListener('submit', (e) => {
  e.preventDefault()
  new FormData(newGame)
})

newGame.addEventListener('formdata', (e) => {
  const entry = e.formData.get('newword')
  if (validateWord(entry)) {
    const word = btoa(entry)
    const puzzleURL = `${baseURL}?${paramName}=${word}`
    const linkContainer = document.querySelector('.newpuzzle')
    const puzzleLink = document.querySelector('.newpuzzle > a[href]')
    puzzleLink.href = puzzleURL;
    linkContainer.classList.remove('no-visibility')
    puzzleLink.focus()
  }
});

function wordLength(word) {
  return word.length === WORD_LENGTH ? true : false
}

function wordValid(word) {
  return wordDict.includes(word) ? true : false
}

function validateWord(entry) {
  let errorText;

  if (!wordLength(entry)) {
    errorText = "Not five letters"
  }
  else if (!wordValid(entry)) {
    errorText = `${entry.toUpperCase()} Not in word list`
  }

  if(errorText) {
    inputError.textContent = errorText
    newWord.ariaInvalid = true
    newWord.focus()
    return
  }

  return true
}

newWord.addEventListener('input', (e) => {
  if(newWord.value.length == 0) {
    newWord.ariaInvalid = false
    inputError.textContent = ''
  }
})

startInteraction()

function startInteraction() {
  document.addEventListener("click", handleMouseClick)
  document.addEventListener("keydown", handleKeyPress)
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick)
  document.removeEventListener("keydown", handleKeyPress)
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key)
    return
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess()
    return
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey()
    return
  }
}

function handleKeyPress(e) {
  // ignore keypresses when focus is in the page header
  const header = document.querySelector('header')
  if (header.contains(document.activeElement)) {
    return
  }

  // ignore keypresses when modifier key is active
  if (e.altKey || e.ctrlKey || e.metaKey) {
    return
  }

  if (e.key === "Enter") {
    e.preventDefault();
    submitGuess()
    return
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
    deleteKey()
    return
  }

  if (e.key.match(/^[a-z]$/)) {
    e.preventDefault();
    pressKey(e.key)
    return
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles()
  if (activeTiles.length >= WORD_LENGTH) return
  const nextTile = guessGrid.querySelector(":not([data-letter])")
  nextTile.dataset.letter = key.toLowerCase()
  nextTile.textContent = key
  nextTile.dataset.state = "active"
}

function deleteKey() {
  const activeTiles = getActiveTiles()
  const lastTile = activeTiles[activeTiles.length - 1]
  if (lastTile == null) return
  lastTile.textContent = ""
  delete lastTile.dataset.state
  delete lastTile.dataset.letter
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()]
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters")
    shakeTiles(activeTiles)
    return
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter
  }, "")

  if (!wordValid(guess)) {
    showAlert(`${guess.toUpperCase()} Not in word list`)
    shakeTiles(activeTiles)
    return
  }

  stopInteraction()
  activeTiles.forEach((...params) => flipTile(...params, guess))
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter
  const key = keyboard.querySelector(`[data-key="${letter}"i]`)
  setTimeout(() => {
    tile.classList.add("flip")
  }, (index * FLIP_ANIMATION_DURATION) / 2)

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip")
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct"
        key.classList.add("correct")
        key.querySelector('.vh').textContent = "correct"
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location"
        key.classList.add("wrong-location")
        key.querySelector('.vh').textContent = "present"
      } else {
        tile.dataset.state = "wrong"
        key.classList.add("wrong")
        key.querySelector('.vh').textContent = "absent"
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction()
            checkWinLose(guess, array)
          },
          { once: true }
        )
      }
    },
    { once: true }
  )
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]')
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div")
  alert.textContent = message
  alert.classList.add("alert")
  alertContainer.prepend(alert)
  if (duration == null) return

  setTimeout(() => {
    alert.classList.add("hide")
    alert.addEventListener("transitionend", () => {
      alert.remove()
    })
  }, duration)
}

function shakeTiles(tiles) {
  tiles.forEach(tile => {
    tile.classList.add("shake")
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake")
      },
      { once: true }
    )
  })
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert("You Win", 5000)
    danceTiles(tiles)
    stopInteraction()
    return
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
  if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), null)
    stopInteraction()
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance")
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance")
        },
        { once: true }
      )
    }, (index * DANCE_ANIMATION_DURATION) / 5)
  })
}

class modalBtn extends HTMLElement {
	constructor() {
		super();

		const btn = this.querySelector('button');
		const dialogId = btn.getAttribute('commandfor');

		// change button in dialog to form element
		const dialog = document.querySelector(`#${dialogId}`);
		const btnClose = dialog.querySelector('[command="close"]');
    btnClose.type = 'submit';

		btn.addEventListener('click', () => {
			dialog.showModal();
		});
	}
}

// progressively enhance in browsers that don't support command/commandfor
const cmdTest = document.createElement('button');
// null in browsers that support, undefined in others
if (cmdTest.commandForElement !== null) {
	customElements.define("modal-btn", modalBtn);
}
cmdTest.remove();
