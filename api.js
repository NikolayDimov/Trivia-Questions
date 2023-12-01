import { fetchFunData, getRandomFunFact } from "./fun.js";

const apiUrl = "https://opentdb.com/api.php";
let selectAmount = "";
let selectDifficulty = "";
let selectedCategory = "";

const category = document.getElementById("category_span");
const difficulty = document.getElementById("difficulty_span");
const question = document.getElementById("question_span");
const questionOptions = document.querySelector(".question-options");

const totalQuestion = document.getElementById("total-question");
const checkBtn = document.getElementById("next-question");
const playAgainBtn = document.getElementById("play-again");

const result = document.getElementById("result");

const downloadResults = document.getElementById("downloadReasult");

let currentCorrectAnswer = "";
let currentCorrectScore = 0;
let currentAskedCount = 0;
let currentTotalQuestion = 0;

document.getElementById("getDataButton").addEventListener("click", getData);

// Counter questions
document.addEventListener("DOMContentLoaded", () => {
  getData();
  eventListeners();
  totalQuestion.textContent = currentTotalQuestion;
});

// Fetching data from Trivia
async function getData() {
  try {
    document.getElementById("downloadReasult").style.display = "none";

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

    // Clear existing options and result
    questionOptions.innerHTML = "";
    result.innerHTML = "";

    // Reset question count and score
    currentAskedCount = 0;
    currentCorrectScore = 0;

    // Update the total question count
    totalQuestion.textContent = currentTotalQuestion;

    // Without FunFacts
    // Show first question on the page - I don't use fetch result from this function showQuestion(data.results[0]);
    // showQuestion(data.results[0]);
    // Instead I use function loadQuestions(); that take data from localStorage
    // loadQuestions();

    // With FunFacts
    const funDataPromise = fetchFunData();
    funDataPromise.then((funData) => {
      // Show first question on the page
      loadQuestions();

      // Display a random fun fact
      displayRandomFunFact(funData);

      // Store fun data for later use
      const storedFunData = funData;

      // Update fun fact on every question change
      document.getElementById("next-question").addEventListener("click", () => {
        displayRandomFunFact(storedFunData);
      });
    });
  } catch (error) {
    console.error(error);
  }
}

// Event listeners to Check Button and Play Again Btn
function eventListeners() {
  checkBtn.addEventListener("click", checkAnswer);
  playAgainBtn.addEventListener("click", restartQuiz);
}

// FunFacts random display function
function displayRandomFunFact(funData) {
  const funFactElement = document.querySelector(".fun-fatcs-p");
  const randomFunFact = getRandomFunFact(funData);
  funFactElement.textContent = randomFunFact;
}

// Load question from localStorage
function loadQuestions() {
  const storedQuestions = localStorage.getItem("questions");

  if (storedQuestions) {
    // console.log("Questions found in local storage");
    const questions = JSON.parse(storedQuestions);

    // Check if there are more questions in the local storage
    if (currentAskedCount < currentTotalQuestion) {
      showQuestion(questions[currentAskedCount]);
    } else {
      // If no more questions in local storage, fetch new questions
      getData();
    }
  } else {
    console.log("No questions found in local storage. Fetching new questions");
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
        `Incorrect answer! The correct answer is: ${currentCorrectAnswer}`
      );
    }

    currentAskedCount++;
    checkCount();
    // Re-enable the button
    checkBtn.disabled = false;
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
    if (currentCorrectScore >= 7) {
      result.innerHTML += `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-grin-stars"></i>`;
    } else if (currentCorrectScore >= 4) {
      result.innerHTML += `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-smile-wink"></i></p>`;
    } else {
      result.innerHTML += `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-sad-tear"></i></i></p>`;
    }

    localStorage.setItem(
      "currentCorrectScore",
      JSON.stringify(currentCorrectScore)
    );

    playAgainBtn.style.display = "block";
    checkBtn.style.display = "none";

    const wrongAnswers = selectAmount - currentCorrectScore;
    localStorage.setItem("wrongAnswers", JSON.stringify(wrongAnswers));
    downloadResults.style.display = "block";
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

  document.getElementById("downloadReasult").style.display = "none";

  localStorage.clear("question");
  localStorage.clear("selectAmount");
  localStorage.clear("selectDifficulty");
  localStorage.clear("selectedCategory");
  localStorage.clear("currentCorrectScore");
  localStorage.clear("wrongAnswers");
}

// Download function
const worker = new Worker("./worker.js", { type: "module" });

downloadResults.addEventListener("click", () => {
  const selectAmount = JSON.parse(localStorage.getItem("selectAmount"));
  const wrongAnswers = JSON.parse(localStorage.getItem("wrongAnswers"));
  const selectedCategory = JSON.parse(localStorage.getItem("selectedCategory"));
  const selectDifficulty = JSON.parse(localStorage.getItem("selectDifficulty"));
  const currentCorrectScore = JSON.parse(
    localStorage.getItem("currentCorrectScore")
  );

  worker.onmessage = (e) => {
    const blob = e.data;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "QuizResults.zip";
    link.click();
  };
  worker.postMessage({
    currentCorrectScore,
    selectAmount,
    wrongAnswers,
    selectedCategory,
    selectDifficulty,
  });
});
