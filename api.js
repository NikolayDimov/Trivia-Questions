const url = "https://opentdb.com/api.php?amount=10&type=multiple";

const category = document.getElementById("category");
const difficulty = document.getElementById("difficulty");
const question = document.getElementById("question");
const questionOptions = document.querySelector(".question-options");

const totalQuestion = document.getElementById("total-question");
const checkBtn = document.getElementById("check-answer");
const playAgainBtn = document.getElementById("play-again");

let currentCorrectAnswer = "";
let currentCorrectScore = (currentAskedCount = 0);
let currentTotalQuestion = 10;
let result = "";

// Fetching data from Trivia
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

    result.innerHTML = "";
    showQuestion(data.results[0]);
  } catch (error) {
    console.error(error);
  }
}

// Event listeners to BTNs
function eventListeners() {
  checkBtn.addEventListener("click", checkAnswer);
  playAgainBtn.addEventListener("click", restartQuiz);
  selectOption(); // Call selectOption after loading questions
}

// Counter questions
document.addEventListener("DOMContentLoaded", () => {
  getData();
  eventListeners();
  totalQuestion.textContent = currentTotalQuestion;
});

// Load question from localStorage or fetch new questions
function loadQuestions() {
  const storedQuestions = localStorage.getItem("questions");

  if (storedQuestions) {
    const questions = JSON.parse(storedQuestions);

    // Check if there are more questions in the local storage
    if (currentAskedCount < currentTotalQuestion - 1) {
      showQuestion(questions[currentAskedCount]);
    } else {
      // If no more questions in local storage, fetch new questions
      getData();
    }
  } else {
    getData();
  }
}

// Show question on the screen
function showQuestion(data) {
  currentCorrectAnswer = data.correct_answer;
  let incorrectAnswer = data.incorrect_answers;
  let optionsList = [...incorrectAnswer, currentCorrectAnswer];
  shuffleArray(optionsList);

  category.textContent = `CATEGORY: ${data.category}`;
  difficulty.textContent = `DIFFICULTY: ${data.difficulty}`;
  question.textContent = `${data.question}`;

  // Clear existing options
  questionOptions.innerHTML = "";

  // Create and append new options/answers
  optionsList.forEach((option, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${option}`;
    questionOptions.appendChild(li);
  });

  selectOption();
}

// Helper function to shuffle an array with answers
function shuffleArray(array) {
  array.sort(() => Math.random() - 0.5);
}

// Add click functionality on li
function selectOption() {
  const answerElements = questionOptions.querySelectorAll("li");

  answerElements.forEach((answerElement) => {
    answerElement.addEventListener("click", () => {
      // Remove the "selected" class from all previously selected options
      answerElements.forEach((element) => {
        element.classList.remove("selected");
      });

      // Add the "selected" class to the clicked option
      answerElement.classList.add("selected");
    });
  });
}

// Adding class="selected" for the chosen element
function handleOptionClick(event) {
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

// Answer checking
function checkAnswer() {
  const selectedOption = questionOptions.querySelector(".selected");

  if (selectedOption) {
    checkBtn.disabled = true; // Disable the button to prevent multiple clicks
    const selectedAnswer = selectedOption.textContent.trim();

    if (selectedAnswer === currentCorrectAnswer) {
      currentCorrectScore++;
      showResult(true, `Correct Answer!`);
    } else {
      showResult(
        false,
        `Incorrect Answer! Correct Answer: ${currentCorrectAnswer}`
      );
    }

    currentAskedCount++;
    checkCount();
    checkBtn.disabled = false; // Re-enable the button
  } else {
    showResult(false, `Please select an option!`);
  }
}

// Show result information
function showResult(isCorrect, message) {
  result.innerHTML = `<p><i class="fas ${
    isCorrect ? "fa-check" : "fa-times"
  }"></i>${message}</p>`;
}

// Check count and end quiz if needed
function checkCount() {
  setCount();
  if (currentAskedCount === currentTotalQuestion) {
    result.innerHTML += `<p>Your score is ${currentCorrectScore}.</p>`;
    playAgainBtn.style.display = "block";
    checkBtn.style.display = "none";
  } else {
    setTimeout(loadQuestions, 300); // Corrected function name
  }
}

// Set count in the UI
function setCount() {
  totalQuestion.textContent = `${currentAskedCount}/${currentTotalQuestion}`;
}

// Restart the quiz
function restartQuiz() {
  currentCorrectScore = currentAskedCount = 0;
  playAgainBtn.style.display = "none";
  checkBtn.style.display = "block";
  checkBtn.disabled = false;
  setCount();
  getData();
}
