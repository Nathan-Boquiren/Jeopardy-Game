let cl = console.log;

// DOM Elements

const playerNameContainer = document.getElementById("name-list");
const addPlayerbtn = document.getElementById("add-player-btn");

const formModal = document.getElementById("form-modal");
const playerNameForm = document.getElementById("players-form");
const nameInput = playerNameForm.querySelector("input");
const submitBtn = document.getElementById("submit-btn");

// Modal Functionality
addPlayerbtn.addEventListener("click", () => formModal.showModal());
submitBtn.addEventListener("click", () => formModal.close());

// Add players

playerNameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const playerName = nameInput.value;
  addPlayer(playerName);
  nameInput.value = "";
});

function addPlayer(name) {
  const nameList = JSON.parse(sessionStorage.getItem("playerNames")) || [];
  nameList.push(name);
  sessionStorage.setItem("playerNames", JSON.stringify(nameList));

  renderNameList(nameList);
}

function renderNameList(names) {
  playerNameContainer.innerHTML = "";
  for (const name of names) {
    const nameElement = document.createElement("li");
    nameElement.innerText = name;
    playerNameContainer.append(nameElement);
  }
}
