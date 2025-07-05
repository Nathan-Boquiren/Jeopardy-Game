let cl = console.log;

// === DOM Elements ===
const categoriesContainer = document.getElementById("game-board");
const popUp = document.getElementById("question-answer");
const questionWrapper = document.getElementById("question-wrapper");
const showAnswerBtn = document.getElementById("show-answer-btn");
const returnBtn = document.getElementById("return-btn");
const playersContainer = document.getElementById("players-container");
const currentPlayerWrapper = document.getElementById("current-p-wrapper");
const timeMsg = document.getElementById("time-msg");
const finalJeopardyBtn = document.getElementById("final-jeopardy-btn");

// === Variables ===
let players = JSON.parse(sessionStorage.getItem("playerNames")).map((name) => ({
  name: name,
  score: 0,
}));

let currentPlayerIndex = 0;
let currentPlayerTurn = players[currentPlayerIndex];

// === fetch question data ===
document.addEventListener("DOMContentLoaded", () => {
  fetch("../questions/independence-questions.json")
    .then((res) => res.json())
    .then((data) => populateCategories(data.mainCategories))
    .catch((error) => console.error("JSON fetch error:", error));
});

// function to populate category headers with category names
function populateCategories(categories) {
  for (let i = 0; i < categories.length; i++) {
    // prettier-ignore
    categoriesContainer.innerHTML += `
      <div class="category-column" id="category-${i + 1}">
        <div class="category-header txt-shadow sub-section accent-font" id="header-${i + 1}">${categories[i].name}</div>
        <div data-cat-num="${i}" class="prblm-btn sub-section txt-shadow accent-font">200</div>
        <div data-cat-num="${i}" class="prblm-btn sub-section txt-shadow accent-font">400</div>
        <div data-cat-num="${i}" class="prblm-btn sub-section txt-shadow accent-font">600</div>
        <div data-cat-num="${i}" class="prblm-btn sub-section txt-shadow accent-font">800</div>
        <div data-cat-num="${i}" class="prblm-btn sub-section txt-shadow accent-font">1000</div>
      </div>`;
  }

  // add button click event listeners
  addEventListeners();
}
// === function for each problem button ===
function addEventListeners() {
  document.querySelectorAll(".prblm-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      btn.classList.add("clicked");
      sessionStorage.setItem("currentPrice", this.innerHTML);
      const category = this.dataset.catNum;
      const price = this.innerHTML;
      showQuestion(category, price);
    });
  });
}

function showQuestion(catNum, price) {
  popUp.classList.add("show-question");
  popUp.querySelector(".price").innerHTML = price;

  fetch("../questions/independence-questions.json")
    .then((res) => res.json())
    .then((data) => {
      const categoryName = data.mainCategories[catNum].name;
      const question = data.mainCategories[catNum].questions[price].question;
      const answer = data.mainCategories[catNum].questions[price].answer;

      popUp.querySelector(".category").innerHTML = categoryName;
      popUp.querySelector("#question-txt").innerHTML = question;
      popUp.querySelector("#answer-txt").innerHTML = answer;
    })
    .catch((err) => console.error("JSON fetch error:", err));

  showAnswerBtn.addEventListener("click", showAnswer);

  startCountdown(30);
}

returnBtn.addEventListener("click", () => {
  popUp.classList.remove("show-answer");
  popUp.classList.remove("show-question");
  advancePlayer();
});

function showAnswer() {
  popUp.classList.add("show-answer");
}

// ===== update next player =====

function renderCurrentPlayer() {
  currentPlayerTurn = players[currentPlayerIndex];
  currentPlayerWrapper.innerHTML = currentPlayerTurn.name;
}

function advancePlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  renderCurrentPlayer();
}

// show first player
renderCurrentPlayer();

function renderPlayers() {
  playersContainer.innerHTML = "";

  for (let i = 0; i < players.length; i++) {
    let winningPlayer = getWinningPlayer();
    playersContainer.innerHTML += `
      <div class="player-container">
          <div class="player-name-wrapper accent-font">${players[i].name}</div>
          <span class="${
            players[i] === winningPlayer ? "highest-score" : ""
          } player-score accent-font">${players[i].score}</span>
          <span class="material-symbols-rounded delete-player" data-player-name="${
            players[i].name
          }">delete</span>
      </div>`;
  }

  addPlayerBtnEvents();
}

function getWinningPlayer() {
  let winningPlayer;
  let highestScore = 0;
  for (const p of players) {
    if (p.score > highestScore) {
      highestScore = p.score;
      winningPlayer = p;
    }
  }
  return winningPlayer;
}

renderPlayers();

function addPlayerBtnEvents() {
  const deletePlayerBtns = document.querySelectorAll(".delete-player");
  const playerScoreWrappers = document.querySelectorAll(".player-score");

  deletePlayerBtns.forEach((btn) => {
    btn.addEventListener("click", () => deletePlayer(btn));
  });

  playerScoreWrappers.forEach((scoreWrapper) => {
    scoreWrapper.addEventListener("click", () => updateScore(scoreWrapper));
  });
}

function deletePlayer(btn) {
  const name = btn.dataset.playerName;
  players.splice(players.indexOf(name), 1);
  sessionStorage.setItem("playerNames", JSON.stringify(players));
  renderPlayers();
}

function updateScore(playerScoreWrapper) {
  const score = sessionStorage.getItem("currentPrice");
  // prettier-ignore
  const playerName = playerScoreWrapper.parentElement.querySelector(".player-name-wrapper").innerText;
  const player = players.find((p) => p.name === playerName);
  player.score += Number(score);
  renderPlayers();
}

// ===== TIMER =====

function startCountdown(duration) {
  const timerBar = document.getElementById("timer-bar");
  timerBar.style.width = "100%";
  const start = performance.now();

  function update(now) {
    const elapsed = (now - start) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    const percent = (remaining / duration) * 100;
    timerBar.style.width = `${percent}%`;

    const isVisible = getComputedStyle(questionWrapper).display !== "none";

    if (remaining > 0 && isVisible) {
      requestAnimationFrame(update);
    } else if (remaining <= 0 && isVisible) {
      timerBar.style.width = "100%";
      timeMsg.classList.add("show");
      setTimeout(() => {
        timeMsg.classList.remove("show");
      }, 2000);
    } else if (remaining <= 0 && !isVisible) {
      timerBar.style.width = "100%";
    }
  }

  requestAnimationFrame(update);
}

// ===== FINAL JEOPARDY =====
finalJeopardyBtn.addEventListener("click", finalJeopardy);

function finalJeopardy() {
  popUp.classList.add("show-question");

  fetch("../questions/independence-questions.json")
    .then((res) => res.json())
    .then((data) => {
      const question = data.finalJeopardy.question;
      const answer = data.finalJeopardy.answer;

      popUp.querySelector(".category").innerHTML = "Final Jeopardy";
      popUp.querySelector("#question-txt").innerHTML = question;
      popUp.querySelector("#answer-txt").innerHTML = answer;
    })
    .catch((err) => console.error("JSON fetch error:", err));

  showAnswerBtn.addEventListener("click", showAnswer);

  startCountdown(60);
  addFinalScoreBtns();
}

function addFinalScoreBtns() {
  const playerWrappers = document.querySelectorAll(".player-container");

  playerWrappers.forEach((wrapper) => {
    wrapper.querySelector(".player-score").classList.add("disabled");
    wrapper.innerHTML += `<div class="final-answer-status">
        <span class="material-symbols-rounded answer-right" data-status="right">check_circle</span>
        <span class="material-symbols-rounded answer-wrong" data-status="wrong">cancel</span>
      </div>`;

    const scoreWrapper = wrapper.querySelector(".player-score");
    const playerName = wrapper.querySelector(".player-name-wrapper").innerText;
    const player = players.find((p) => p.name === playerName);

    const statusBtns = wrapper.querySelectorAll("span");

    statusBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const status = btn.dataset.status;

        switch (status) {
          case "right":
            player.score *= 2;
            scoreWrapper.style.color = "#32cd32";
            break;
          case "wrong":
            player.score = 0;
            scoreWrapper.style.color = "#ff0000";
            break;
          default:
            break;
        }
        scoreWrapper.innerHTML = player.score;
        wrapper.querySelector(".final-answer-status").style.display = "none";

        if (wrapper === playersContainer.lastElementChild) endGame();
      });
    });
  });
}

function endGame() {
  let winners = calculateWinners();

  document.body.classList.add("show-end-screen");
  const winnerContainer = document.getElementById("winner-container");
  const endPageHeader = document.getElementById("winner-header");

  if (winners.length > 1) {
    endPageHeader.innerText = "The Winners are:";
    winnerContainer.innerHTML = `${winners
      .map(
        (name) =>
          `<span class="winner-name accent-font sub-section">${name}</span>`
      )
      .join(`<p class="accent-font">,</p>`)}`;
  } else if (winners.length === 1) {
    endPageHeader.innerText = "The Winner is:";
    winnerContainer.innerHTML = `<span class="winner-name accent-font sub-section">${winners[0]}</span>`;
  } else {
    endPageHeader.innerText = "There are no winners. Y'all are a bunch of";
    winnerContainer.innerHTML = `<img src="dum-dums.jpg">`;
  }
}

function calculateWinners() {
  let winnerScore = 0;
  let winners = [];

  players.forEach((player) => {
    winnerScore = Math.max(winnerScore, player.score);
  });

  players.forEach((player) => {
    if (winnerScore !== 0 && player.score === winnerScore) {
      winners.push(player.name);
    }
  });

  return winners;
}
