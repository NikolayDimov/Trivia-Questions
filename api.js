const url = "https://opentdb.com/api.php?amount=10&type=multiple";

const category = document.getElementById("category");
const difficulty = document.getElementById("difficulty");
const question = document.getElementById("question");
const questionOptions = document.querySelector(".question-options");
const correctScore = document.getElementById("correct-score");
const totalQuestion = document.getElementById("total-question");
const checkBtn = document.getElementById("check-answer");
const playAgainBtn = document.getElementById("play-again");

let currentCorrectScore = (askedCount = 0);
let currentTotalQuestion = 10;

document.addEventListener("DOMContentLoaded", () => {
  loadQuestions();
  totalQuestion.textContent = currentTotalQuestion;
  correctScore.textContent = currentCorrectScore;
});

async function getData() {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.results);

    // Store questions in localStorage
    localStorage.setItem("questions", JSON.stringify(data.results));

    showQuestion(data.results[0]);
  } catch (error) {
    console.error(error);
  }
}

// Event listeners to BTNs
function eventListeners() {
  checkBtn.addEventListener("click", checkAnswer);
  playAgainBtn.addEventListener("click", restartQuiz);
}

// Load question from localStorage
function loadQuestions() {
  const storedQuestions = localStorage.getItem("questions");

  if (storedQuestions) {
    const questions = JSON.parse(storedQuestions);
    showQuestion(questions[0]);
  } else {
    getData();
  }
}

function showQuestion(data) {
  let correctAnswer = data.correct_answer;
  let incorrectAnswer = data.incorrect_answers;
  let optionsList = [...incorrectAnswer, correctAnswer];
  shuffleArray(optionsList);

  category.textContent = `CATEGORY: ${data.category}`;
  difficulty.textContent = `DIFFICULTY: ${data.difficulty}`;
  question.textContent = `${data.question}`;

  // Clear existing options
  questionOptions.innerHTML = "";

  // Create and append new options
  optionsList.forEach((option, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${option}`;
    questionOptions.appendChild(li);
  });

  selectOption();
}

// Helper function to shuffle an array
function shuffleArray(array) {
  array.sort(() => Math.random() - 0.5);
}

function selectOption() {
  console.log("selectOption function called");

  questionOptions.addEventListener("click", handleOptionClick);
}

function handleOptionClick(event) {
  // console.log("Click event triggered");

  const clickedElement = event.target;

  if (clickedElement.tagName === "LI") {
    // console.log("Clicked LI element:", clickedElement);

    const selectedOptions = questionOptions.querySelectorAll(".selected");

    selectedOptions.forEach((option) => {
      option.classList.remove("selected");
    });

    clickedElement.classList.add("selected");
    // console.log("Selected option:", clickedElement.textContent);
  }
}
