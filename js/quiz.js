let isQuizing = false;
let homeScreen = document.getElementById('home');
let quizScreen = document.getElementById('quiz');
let resultScreen = document.getElementById('results');
let backBtn = document.getElementById('back-btn');
let surahSearch = document.getElementById('surah-search-input');
let backhome = document.getElementById('home-back');
let score = 0;
let questionIndex = 0;
let quizQuestions = null;
let timer; // Timer for the countdown
let currentTime = 0; // Store the current time globally
let surahs = [];
let difficulty = 'easy'; // Default difficulty

async function getQuestions() {
    const response = await fetch('../questions.json');
    const data = await response.json();
    return data;
}

function showHomeScreen() {
    resultScreen.style.display = 'none';
    homeScreen.style.display = 'block';
    quizScreen.style.display = 'none';
}

function showQuizScreen() {
    resultScreen.style.display = 'none';
    homeScreen.style.display = 'none';
    quizScreen.style.display = 'block';
}

function showResultScreen() {
    resultScreen.style.display = 'block';
    homeScreen.style.display = 'none';
    quizScreen.style.display = 'none';
}

async function startQuiz() {
    if (surahs.length === 0) {
        alert('Please select at least one surah to proceed.');
        return;
    }

    showQuizScreen();
    const allQuestions = await getQuestions();

    // Filter questions based on selected surahs
    const filteredQuestions = allQuestions.filter(question =>
        surahs.some(surah => surah.surahNumber === question.id)
    );

    // Shuffle and get 10 random questions
    quizQuestions = filteredQuestions.sort(() => Math.random() - 0.5).slice(0, 10);

    showQuestion();

    let time;
    switch (difficulty) {
        case 'easy':
            time = 15;
            break;
        case 'medium':
            time = 10;
            break;
        case 'hard':
            time = 5;
            break;
    }

    startTimer(time);

    isQuizing = true;
}

function startTimer(time) {
    let secondsForRest = time;
    timer = setInterval(() => {
        document.getElementById('progress').value = time;
        time--;

        if (time < 0) {
            clearInterval(timer);
            if (questionIndex < quizQuestions.length - 1) {
                time = secondsForRest;
                document.getElementById('progress').value = time;
                startTimer(time);
                nextQuestion();
            } else {
                // End the quiz if it's the last question
                endGame();
            }
        }
    }, 1000);
}


function showQuestion() {
    // Ensure that quizQuestions and questionIndex are valid
    if (!quizQuestions || questionIndex >= quizQuestions.length) return;

    let question = quizQuestions[questionIndex];

    // Set question text
    document.getElementById('question').innerText = question.question;

    // Set meaning text
    document.getElementById('meaning').innerText = question.meaning || '';

    // Get all buttons for options
    let options = [];
    for (let i = 0; i < 4; i++) {
        options.push(document.getElementById('option-' + i));
    }

    // Ensure we have four options to display
    let allOptions = [question.answer, ...question.options];

    // Shuffle options to ensure they are in random order
    let shuffledOptions = allOptions.sort(() => Math.random() - 0.5).slice(0, 4);

    // Update buttons with shuffled options
    options.forEach((button, index) => {
        button.innerText = shuffledOptions[index] || '';
        button.onclick = () => {
            if (shuffledOptions[index] === question.answer) {
                score++;
            }
            nextQuestion();
        };
    });
}


function endGame() {
    clearInterval(timer);
    showHomeScreen();
    showResultScreen();
    document.getElementById('score').innerText = `${score} / ${quizQuestions.length}`;
    document.getElementById('progress').value = 0;
    questionIndex = 0;
    score = 0;
    surahs = [];
    isQuizing = false;
    currentTime = 0;
    timer = null;

    document.getElementById('surah-search-input').value = '';

    loadSurahs();

    setTimeout(() => {
        showHomeScreen();
    }, 3000);
}

function nextQuestion() {
    questionIndex++;
    if (questionIndex < quizQuestions.length) {
        showQuestion();
        let time;
        switch (difficulty) {
            case 'easy':
                time = 15;
                break;
            case 'medium':
                time = 10;
                break;
            case 'hard':
                time = 5;
                break;
        }
        startTimer(time);
    } else {
        endGame();
    }
}


function loadSurahs() {
    let surahDiv1 = document.getElementById('surats');

    fetch('../js/surats.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(surah => {
                let surahNumber = surah.surahNumber;
                let surahName = surah.name;
                let surahDiv = document.createElement('div');
                surahDiv.classList.add('surah-div');
                surahDiv.innerHTML = `
                    <input type="checkbox" name="surah" id="surah-${surahName}">
                    <p id="surah-name">${surahName}</p>
                    <p id="surah-number">${surahNumber}</p>
                `;

                surahDiv1.appendChild(surahDiv);

                document.getElementById(`surah-${surahName}`).onclick = function () {
                    if (this.checked) {
                        surahs.push({ surahNumber: surah.surahNumber, name: surah.name });
                    } else {
                        surahs = surahs.filter(s => s.name !== surahName);
                    }
                };
            });
        })
        .catch(error => console.error('Error loading surahs:', error));
}

function setDifficulty(level) {
    difficulty = level;
    startQuiz();
}

document.getElementById('easy').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('medium').addEventListener('click', () => setDifficulty('medium'));
document.getElementById('hard').addEventListener('click', () => setDifficulty('hard'));

loadSurahs();


surahSearch.addEventListener('input', () => {
    const searchValue = surahSearch.value.toLowerCase();
    const surahDivs = document.querySelectorAll('.surah-div');
    surahDivs.forEach(div => {
        if (div.textContent.toLowerCase().includes(searchValue)) {
            div.style.display = 'flex';
        } else {
            div.style.display = 'none';
        }
    });
});
