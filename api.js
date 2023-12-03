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

// Provided an event listener attached to the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
    getData();
    eventListeners();
    totalQuestion.textContent = currentTotalQuestion;
});

// * Fetching data from Trivia * ------------------------------------------------------------------- START
// --- Main function ---
export async function getData() {
    try {
        hideDownloadResultButton(); // Download result button hede, display wnhen qiuz end
        setQuizParameters(); // Quiz parameters display on screen
        const apiEndpoint = buildApiEndpoint(); // Build Api Endpoints
        const response = await fetchTriviaData(apiEndpoint); // Fetching data from Trivia App
        handleApiResponse(response); // Store questions in localStorage
        clearOptionsAndResult(); // Clear existing options and result
        resetQuestionCountAndScore(); // Reset question count and score
        updateTotalQuestionCount(); // Update the total question count
        setupQuizWithFunFacts(); // Fetch Fun Facts
        fixBugWithButtonsDisplay(); // Fixing bug with generate new quiz and Next btn and Play Again btn
    } catch (error) {
        console.error(error);
    }
}
// --- Main function ---

// -- Functions helpers --
// Download result button hede, display wnhen qiuz end
function hideDownloadResultButton() {
    document.getElementById("downloadReasult").style.display = "none";
}

// Quiz parameters display on screen
function setQuizParameters() {
    selectAmount = document.getElementById("selected_amount").value;
    selectDifficulty = document.getElementById("selected_difficulty").value;
    selectedCategory = document.getElementById("selected_category").value;
}

// Build Api Endpoints
function buildApiEndpoint() {
    const difficultyParam = selectDifficulty !== "any" ? `${selectDifficulty}` : "";
    const categoryParam = selectedCategory !== "any" ? `${selectedCategory}` : "";
    // Update the total number of questions
    currentTotalQuestion = Number(selectAmount);
    return `${apiUrl}?amount=${selectAmount}&category=${categoryParam}&difficulty=${difficultyParam}&type=multiple`;
}

// Fetching data from Trivia App
async function fetchTriviaData(apiEndpoint) {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

// Store questions in localStorage
function handleApiResponse(data) {
    console.log(data.results);
    localStorage.setItem("questions", JSON.stringify(data.results));
    localStorage.setItem("selectAmount", JSON.stringify(selectAmount));
    localStorage.setItem("selectDifficulty", JSON.stringify(selectDifficulty));
    localStorage.setItem("selectedCategory", JSON.stringify(selectedCategory));
}

// Clear existing options and result
function clearOptionsAndResult() {
    questionOptions.innerHTML = "";
    result.innerHTML = "";
}

// Reset question count and score
function resetQuestionCountAndScore() {
    currentAskedCount = 0;
    currentCorrectScore = 0;
}

// Update the total question count
function updateTotalQuestionCount() {
    totalQuestion.textContent = currentTotalQuestion;
}

// Fetch Fun Facts
function setupQuizWithFunFacts() {
    const funDataPromise = fetchFunData();
    funDataPromise.then((funData) => {
        loadQuestions();
        displayRandomFunFact(funData);
        const storedFunData = funData;
        document.getElementById("next-question").addEventListener("click", () => {
            displayRandomFunFact(storedFunData);
        });
    });
}

// Fixing bug with generate new quiz and Next btn and Play Again btn
function fixBugWithButtonsDisplay() {
    checkBtn.style.display = "block";
    playAgainBtn.style.display = "none";
}
// -- Functions helpers --
// * Fetching data from Trivia * ------------------------------------------------------------------- END

// Event listeners to Check Button and Play Again Btn
function eventListeners() {
    checkBtn.addEventListener("click", checkAnswer);
    playAgainBtn.addEventListener("click", restartQuiz);
}

// FunFacts random display function
function displayRandomFunFact(funData) {
    const funFactElement = document.querySelector(".fun-fatcs-p");
    const randomFunFact = getRandomFunFact(funData);
    funFactElement.textContent = `"${randomFunFact}"`;
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

// Show question options on the screen ------------------------------------------------------------------- START
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
// Show question options on the screen ------------------------------------------------------------------- END

// Adding class="selected" for the chosen element
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

// Answer checking
function checkAnswer() {
    const selectedOption = questionOptions.querySelector("li.selected");

    if (selectedOption) {
        checkBtn.disabled = true; // Disable the button to prevent multiple clicks
        const selectedAnswer = selectedOption.textContent.replace(/^\d+\.\s/, "").trim();

        // console.log("Selected Answer:", selectedAnswer);
        // console.log("Correct Answer:", currentCorrectAnswer);

        if (selectedAnswer === currentCorrectAnswer) {
            currentCorrectScore++;
            showResult(true, `Correct Answer!`);
        } else {
            showResult(false, `Incorrect answer! The correct answer is: ${currentCorrectAnswer}`);
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
    result.innerHTML = `<p><i class="fas ${isCorrect ? "fa-check" : "fa-times"}"></i>${message}</p>`;
}

// * Check count and end quiz if needed * -------------------------------------------------------------------  START
// --- Main function ---
function checkCount() {
    setCount();
    showCheckButton();

    if (isQuizComplete()) {
        handleQuizCompletion();
    } else {
        setTimeout(loadNextQuestion, 500);
    }
}
// --- Main function ---

// -- Functions helpers --
function showCheckButton() {
    checkBtn.style.display = "block";
}

function isQuizComplete() {
    return currentAskedCount === currentTotalQuestion;
}

function handleQuizCompletion() {
    const scoreMessage = getScoreMessage();
    result.innerHTML += scoreMessage;

    storeCurrentScore();
    showQuizOutcomeButtons();
}

// Function helpers on handleQuizCompletion
function getScoreMessage() {
    if (currentCorrectScore >= 7) {
        return `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-grin-stars"></i>`;
    } else if (currentCorrectScore >= 4) {
        return `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-smile-wink"></i></p>`;
    } else {
        return `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-sad-tear"></i></i></p>`;
    }
}

function storeCurrentScore() {
    localStorage.setItem("currentCorrectScore", JSON.stringify(currentCorrectScore));
    const wrongAnswers = selectAmount - currentCorrectScore;
    localStorage.setItem("wrongAnswers", JSON.stringify(wrongAnswers));
}

function showQuizOutcomeButtons() {
    playAgainBtn.style.display = "block";
    checkBtn.style.display = "none";
    downloadResults.style.display = "block";
}
// Function helpers on handleQuizCompletion

function loadNextQuestion() {
    loadQuestions();
}
// -- Functions helpers --
// * Check count and end quiz if needed * -------------------------------------------------------------------  END

// Set count in the UI
function setCount() {
    totalQuestion.textContent = `${currentAskedCount}/${currentTotalQuestion}`;
}

// * Restart the quiz * ------------------------------------------------------------------- START
// --- Main function ---
function restartQuiz() {
    resetQuizState();
    displayButtonsAfterRestart();
    setCount();
    getData();

    // Fetch new fun facts
    fetchFunData()
        .then((funData) => {
            // Update the stored fun data
            const storedFunData = funData;

            // Display a random fun fact
            displayRandomFunFact(storedFunData);
        })
        .catch((error) => {
            console.error(error);
        });

    hideDownloadResultButton();
    clearLocalStorage();
}
// --- Main function ---

// -- Functions helpers --
function resetQuizState() {
    currentCorrectScore = currentAskedCount = 0;
    playAgainBtn.style.display = "none";
    checkBtn.style.display = "block";
    checkBtn.disabled = false;
}

function displayButtonsAfterRestart() {
    document.getElementById("downloadReasult").style.display = "none";
}

function clearLocalStorage() {
    const keysToClear = ["question", "selectAmount", "selectDifficulty", "selectedCategory", "currentCorrectScore", "wrongAnswers"];

    keysToClear.forEach((key) => {
        localStorage.removeItem(key);
    });
}
// -- Functions helpers --
// * Restart the quiz * ------------------------------------------------------------------- END

// * Download function * ------------------------------------------------------------------- START
const worker = new Worker("./worker.js", { type: "module" });

downloadResults.addEventListener("click", () => {
    const selectAmount = JSON.parse(localStorage.getItem("selectAmount"));
    const wrongAnswers = JSON.parse(localStorage.getItem("wrongAnswers"));
    const selectedCategory = JSON.parse(localStorage.getItem("selectedCategory"));
    const selectDifficulty = JSON.parse(localStorage.getItem("selectDifficulty"));
    const currentCorrectScore = JSON.parse(localStorage.getItem("currentCorrectScore"));

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
// * Download function * ------------------------------------------------------------------- END
