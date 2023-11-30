const apiUrl = "https://opentdb.com/api.php";
let selectAmount = "";
let selectDifficulty = "";
let selectedCategory = "";

document.getElementById("getDataButton").addEventListener("click", getData);

const category = document.getElementById("category_span");
const difficulty = document.getElementById("difficulty_span");
const question = document.getElementById("question_span");
const questionOptions = document.querySelector(".question-options");

const totalQuestion = document.getElementById("total-question");
const checkBtn = document.getElementById("next-question");
const playAgainBtn = document.getElementById("play-again");

const result = document.getElementById("result");

let currentCorrectAnswer = "";
let currentCorrectScore = 0;
let currentAskedCount = 0;
let currentTotalQuestion = 0;

// Fetching data from Trivia
async function getData() {
  // console.log("getData function called");
  try {
    selectAmount = document.getElementById("selected_amount").value;
    selectDifficulty = document.getElementById("selected_difficulty").value;
    selectedCategory = document.getElementById("selected_category").value;

    // Handle "Any" option
    const difficultyParam =
      selectDifficulty !== "any" ? `${selectDifficulty}` : "";
    const categoryParam =
      selectedCategory !== "any" ? `${selectedCategory}` : "";

    // Update the total number of questions
    currentTotalQuestion = Number(selectAmount);

    const apiEndpoint = `${apiUrl}?amount=${selectAmount}&category=${categoryParam}&difficulty=${difficultyParam}&type=multiple`;
    console.log("apiEndpoint", apiEndpoint);

    const response = await fetch(apiEndpoint);
    // console.log("API Response:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.results);

    // Store questions in localStorage
    localStorage.setItem("questions", JSON.stringify(data.results));
    localStorage.setItem("selectAmount", JSON.stringify(selectAmount));
    localStorage.setItem("selectDifficulty", JSON.stringify(selectDifficulty));
    localStorage.setItem("selectedCategory", JSON.stringify(selectedCategory));

    result.innerHTML = "";
    // Show first question on the page - I don't use fetch result from this function showQuestion(data.results[0]);
    // showQuestion(data.results[0]);
    // Instead I use function loadQuestions(); that take data from localStorage
    loadQuestions();
  } catch (error) {
    console.error(error);
  }
}

// Event listeners to Check Button and Play Again Btn
function eventListeners() {
  checkBtn.addEventListener("click", checkAnswer);
  playAgainBtn.addEventListener("click", restartQuiz);
}

// Counter questions
document.addEventListener("DOMContentLoaded", () => {
  getData();
  eventListeners();
  totalQuestion.textContent = currentTotalQuestion;
});

// Load question from localStorage
function loadQuestions() {
  const storedQuestions = localStorage.getItem("questions");

  if (storedQuestions) {
    const questions = JSON.parse(storedQuestions);

    // Check if there are more questions in the local storage
    if (currentAskedCount < currentTotalQuestion) {
      showQuestion(questions[currentAskedCount]);
    } else {
      // If no more questions in local storage, fetch new questions
      getData();
    }
  } else {
    getData();
  }
}

// Show question options on the screen
function showQuestion(data) {
  currentCorrectAnswer = data.correct_answer;
  let incorrectAnswer = data.incorrect_answers;
  let optionsList = [...incorrectAnswer, currentCorrectAnswer];
  shuffleArray(optionsList);

  category.textContent = `${data.category}`;
  difficulty.textContent = `${data.difficulty}`;
  question.textContent = `${data.question}`;

  // Clear existing options
  questionOptions.innerHTML = "";

  // Create and append new options/answers
  optionsList.forEach((option, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${option}`;
    questionOptions.appendChild(li);
  });

  selectAnswers();
}

// Helper function to shuffle an array with answers
function shuffleArray(array) {
  array.sort(() => Math.random() - 0.5);
}

// Add click functionality on li
function selectAnswers() {
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
function handleAnswerClick(event) {
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
  const selectedOption = questionOptions.querySelector("li.selected");

  if (selectedOption) {
    checkBtn.disabled = true; // Disable the button to prevent multiple clicks
    const selectedAnswer = selectedOption.textContent
      .replace(/^\d+\.\s/, "")
      .trim();

    // console.log("Selected Answer:", selectedAnswer);
    // console.log("Correct Answer:", currentCorrectAnswer);

    if (selectedAnswer === currentCorrectAnswer) {
      currentCorrectScore++;
      showResult(true, `Correct Answer!`);
    } else {
      showResult(
        false,
        `Incorrect Answer! The Correct Answer: ${currentCorrectAnswer}`
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
  // console.log("showResult called");
  result.innerHTML = `<p><i class="fas ${
    isCorrect ? "fa-check" : "fa-times"
  }"></i>${message}</p>`;
}

// Check count and end quiz if needed
function checkCount() {
  setCount();
  if (currentAskedCount === currentTotalQuestion) {
    result.innerHTML += `<p>Your score is ${currentCorrectScore}.</p>`;
    localStorage.setItem(
      "currentCorrectScore",
      JSON.stringify(currentCorrectScore)
    );
    playAgainBtn.style.display = "block";
    checkBtn.style.display = "none";
  } else {
    setTimeout(loadQuestions, 500);
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
  localStorage.clear("question");
  localStorage.clear("selectAmount");
  localStorage.clear("selectDifficulty");
  localStorage.clear("selectedCategory");
  localStorage.clear("currentCorrectScore");
}
