const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const startQuizButton = document.getElementById("start-quiz-btn");
const levelSelect = document.getElementById("level-selection");
const categorySelect = document.getElementById("category-selection");
const questionSelect = document.getElementById("question-selection");

let currentQuestionIndex = 0;
let score = 0;
let questions;
let answerSelected = false;


function resetState() 
{
    nextButton.style.display = "none";
    while (answerButtons.firstChild) 
    {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function get_random_element_with_condition(data, condition, n) 
{
    const filteredarray = data.filter(condition);

    if (filteredarray.length >= n) 
    {
        const extract = [];
        while (extract.length < n) 
        {
            const randomindex = Math.floor(Math.random() * filteredarray.length);
            const randomelement = filteredarray.splice(randomindex, 1)[0];
            extract.push(randomelement);
        }
        return extract;
    } 
    else 
    {
        return null;
    }
}

async function designquestionset(le, ca, nu) 
{
    const apiurl = "https://opentdb.com/api.php?amount=50&type=multiple&category=";

    try 
    {
        const response = await fetch(apiurl + ca);

        if (response.status === 429) 
        {
            console.log("Too Many Requests. Waiting before retrying...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await designquestionset(le, ca, nu);
        }

        const data = await response.json();

        let difficultyCondition;
        if (le === "easy") 
        {
            difficultyCondition = x => x.difficulty === "easy";
        } 
        else if (le === "medium") 
        {
            difficultyCondition = x => x.difficulty === "medium";
        } 
        else 
        {
            difficultyCondition = x => x.difficulty === "hard";
        }

        const final_data = get_random_element_with_condition(data.results, difficultyCondition, nu);
        if (final_data.length < nu) 
        {
            throw new Error("Question limit exceeded");
        }
        return final_data;
    } 
    catch (error) 
    {
        console.error("Error fetching data:", error);
        return null;
    }
}

async function startQuiz(level, category, numques) 
{
    resetState();
    questions = await designquestionset(level, category, numques);

    if (!questions) 
    {
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

function showQuestion() 
{
    if (!questions || currentQuestionIndex >= questions.length) 
    {
        showScore();
        return;
    }

    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    const answer = [];
    const correctAnswer = currentQuestion.correct_answer;
    answer.push(currentQuestion.correct_answer);
    answer.push(...currentQuestion.incorrect_answers);

    while (answerButtons.firstChild) 
    {
        answerButtons.removeChild(answerButtons.firstChild);
    }

    for (let i = answer.length - 1; i >= 0; i--) 
    {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [answer[i], answer[randomIndex]] = [answer[randomIndex], answer[i]];
    }

    answer.forEach(answerText => {
        const button = document.createElement("button");
        button.innerHTML = answerText;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        button.addEventListener("click", function (e) {
            const buttonValue = e.target.textContent;
            selectAnswer(buttonValue, correctAnswer);
        });
    });
}

function selectAnswer(buttonValue, correctAnswer) 
{
    const isCorrect = (buttonValue === correctAnswer);

    if (isCorrect) 
    {
        score++;
    }

    Array.from(answerButtons.children).forEach(button => {
        if (button.textContent === correctAnswer) 
        {
            button.classList.add("correct");
        } 
        else 
        {
            button.classList.add("incorrect");
        }
        button.disabled = true;
    });

    nextButton.style.display = "block";
    answerSelected = true;
}

function showScore() 
{
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";
}

function handleNextButton() {
    if (answerSelected) {
        currentQuestionIndex++;
        answerSelected = false; // Reset the flag for the next question
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showScore();
        }
    }
}


function handleUserSelection() 
{
    const selectedLevel = levelSelect.value;
    const selectedCategory = categorySelect.value;
    const selectedNumQuestions = parseInt(questionSelect.value);

    if (selectedLevel && selectedCategory && !isNaN(selectedNumQuestions)) 
    {
        startQuiz(selectedLevel, selectedCategory, selectedNumQuestions);
    }
}

function handleStartQuizButton() 
{
    handleUserSelection();
    startQuizButton.disabled = true; // Disable the start button once the quiz has started
}

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) 
    {
        handleNextButton();
    } 
    else 
    {
        startQuizButton.disabled = false; // Enable the start button for the next quiz
    }
});

startQuizButton.addEventListener("click", handleStartQuizButton);

// Reset state and initiate quiz on page load
resetState();
startQuizButton.disabled = false; // Enable the start button initially


