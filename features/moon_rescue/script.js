const questions = [
    {
        question: "What is the Moon's approximate distance from Earth?",
        options: ["384,400 km", "1,000,000 km", "150,000 km", "50,000 km"],
        answer: 0
    },
    {
        question: "Does the Moon have its own light?",
        options: ["Yes, it burns like the sun", "No, it reflects sunlight", "Yes, due to volcanoes", "No, it's a mirror"],
        answer: 1
    },
    {
        question: "Which phase comes after the New Moon?",
        options: ["Full Moon", "Waxing Crescent", "Waning Gibbous", "Last Quarter"],
        answer: 1
    },
    {
        question: "Who was the first person to walk on the Moon?",
        options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"],
        answer: 2
    },
    {
        question: "What is the name of the Moon's dark plains?",
        options: ["Maria", "Oceans", "Craters", "Valleys"],
        answer: 0
    }
];

let currentQuestion = 0;
let score = 0;
const totalQuestions = questions.length;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const progressBar = document.getElementById('progressBar');
const moonImg = document.getElementById('moonImg');
const storyText = document.getElementById('storyText');

function loadQuestion() {
    if (currentQuestion >= totalQuestions) {
        endGame();
        return;
    }

    const q = questions[currentQuestion];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(index);
        optionsEl.appendChild(btn);
    });

    updateProgress();
}

function checkAnswer(selectedIndex) {
    const q = questions[currentQuestion];
    const buttons = optionsEl.querySelectorAll('button');

    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === q.answer) {
        score++;
        feedbackEl.textContent = 'CORRECT! SYSTEM STABILIZING...';
        feedbackEl.classList.add('success');
        updateMoonState();
    } else {
        feedbackEl.textContent = 'ERROR! TRAJECTORY UNSTABLE.';
        feedbackEl.classList.add('fail');
    }

    currentQuestion++;
    setTimeout(loadQuestion, 1500);
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateMoonState() {
    // Logic to change moon image based on progress/success
    // We have 3 images: moon1.png, moon2.png, moon3.png
    // Simple logic: Start at 1, move to 2 at 40%, 3 at 80%
    const progress = (score / totalQuestions);

    if (progress > 0.6) {
        moonImg.src = 'moon3.png';
    } else if (progress > 0.3) {
        moonImg.src = 'moon2.png';
    } else {
        moonImg.src = 'moon1.png';
    }
}

function endGame() {
    questionEl.textContent = "MISSION COMPLETE";
    optionsEl.innerHTML = '';
    progressBar.style.width = '100%';

    if (score >= 3) {
        feedbackEl.textContent = `SUCCESS! SATELLITE STABILIZED. Score: ${score}/${totalQuestions}`;
        feedbackEl.classList.add('success');
        storyText.textContent = "Great work, Commander. The lunar station is safe.";
        moonImg.src = 'moon3.png';
    } else {
        feedbackEl.textContent = `MISSION FAILED. ORBIT DECAY. Score: ${score}/${totalQuestions}`;
        feedbackEl.classList.add('fail');
        storyText.textContent = "Critical failure. Satellite lost.";
        moonImg.src = 'moon1.png'; // Revert to initial state or a 'bad' state if available
    }

    // Add restart button
    const restartBtn = document.createElement('button');
    restartBtn.textContent = "REBOOT SYSTEM";
    restartBtn.onclick = restartGame;
    optionsEl.appendChild(restartBtn);
}

function restartGame() {
    currentQuestion = 0;
    score = 0;
    moonImg.src = 'moon1.png';
    storyText.textContent = "A lunar satellite is drifting off course. Answer Moon facts correctly to stabilize the mission.";
    loadQuestion();
}

// Start the game logic
// loadQuestion(); <-- Remove this auto-start

/* --- Mission Briefing Logic --- */
const briefingLines = [
    "INCOMING TRANSMISSION...",
    "SOURCE: LUNAR COMMAND",
    "PRIORITY: CRITICAL",
    "OBJECTIVE: STABILIZE SATELLITE ORBIT",
    "AWAITING INPUT..."
];

const missionTextEl = document.getElementById('mission-text');
const startBtn = document.getElementById('start-btn');
const introContent = document.getElementById('intro-content');
const gameContent = document.getElementById('game-content');

let lineIndex = 0;
let charIndex = 0;
let isTyping = false;

function startBriefing() {
    isTyping = true;
    typeLine();
}

function typeLine() {
    if (lineIndex < briefingLines.length) {
        if (charIndex < briefingLines[lineIndex].length) {
            missionTextEl.textContent += briefingLines[lineIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeLine, 50); // Typing speed
        } else {
            missionTextEl.textContent += '\n'; // New line
            lineIndex++;
            charIndex = 0;
            setTimeout(typeLine, 500); // Pause between lines
        }
    } else {
        isTyping = false;
        showStartButton();
    }
}

function showStartButton() {
    startBtn.classList.add('visible');
}

startBtn.onclick = () => {
    introContent.style.display = 'none';
    gameContent.style.display = 'block';

    // Smooth fade in for game content could be nice here too
    gameContent.style.animation = 'fade-in 1s';

    loadQuestion();
};

// Initialize Briefing
window.onload = startBriefing;

