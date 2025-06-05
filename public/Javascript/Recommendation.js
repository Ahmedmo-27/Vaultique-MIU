
const questions = [
    {
        question: "What's your approach to wearing watches?",
        options: [
            "I wear the same reliable watch every day",
            "I match my watch to my outfit/occasion",
            "I collect watches and rotate them frequently",
            "I rarely wear watches"
        ],
        weights: [1, 2, 3, 0]
    },
    {
        question: "Which watch feature matters most to you?",
        options: [
            "Accuracy and reliability",
            "Design and aesthetics",
            "Brand prestige",
            "Smart features"
        ],
        weights: [1, 2, 3, 0]
    },
    {
        question: "What's your ideal watch material?",
        options: [
            "Stainless steel",
            "Leather strap",
            "Titanium",
            "Ceramic or innovative materials"
        ],
        weights: [1, 2, 2, 3]
    },
    {
        question: "What's your budget for a watch?",
        options: [
            "Under $100",
            "$100-$500",
            "$500-$2000",
            "Over $2000"
        ],
        weights: [1, 2, 3, 4]
    },
    {
        question: "Which watch style speaks to you?",
        options: [
            "Classic dress watch",
            "Sporty chronograph",
            "Minimalist modern",
            "Bold statement piece"
        ],
        weights: [1, 2, 2, 3]
    }
];

const watchPersonalities = [
    {
        name: "The Traditionalist",
        description: "You appreciate timeless designs and reliable functionality. For you, a watch is first and foremost a precision instrument.",
        scoreRange: [0, 6],
        recommendation: "Consider classic brands like Rolex Datejust, Omega De Ville, or Grand Seiko"
    },
    {
        name: "The Style Enthusiast",
        description: "You see watches as fashion accessories and love matching them to your outfits and occasions.",
        scoreRange: [7, 10],
        recommendation: "Look at versatile options from Nomos, Frederique Constant, or Cartier Tank"
    },
    {
        name: "The Collector",
        description: "You're passionate about horology and appreciate both the artistry and engineering of fine timepieces.",
        scoreRange: [11, 13],
        recommendation: "Explore pieces from Jaeger-LeCoultre, Patek Philippe, or independent watchmakers"
    },
    {
        name: "The Connoisseur",
        description: "You seek exceptional craftsmanship and unique complications. For you, watches are wearable art.",
        scoreRange: [14, 16],
        recommendation: "High-end pieces from A. Lange & Söhne, Vacheron Constantin, or Roger Dubuis"
    }
];

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const questionCounterEl = document.getElementById('questionCounter');
const progressBarEl = document.getElementById('progressBar');
const skipBtn = document.getElementById('skipBtn');
const quizResultsEl = document.getElementById('quizResults');
const quizContainer = document.querySelector('.quiz-container');

let currentQuestion = 0;
let score = 0;
let userAnswers = [];

function renderQuestion() {
    quizResultsEl.style.display = 'none';
    quizResultsEl.innerHTML = '';

    progressBarEl.style.width = `${(currentQuestion / questions.length) * 100}%`;
    questionCounterEl.textContent = `${currentQuestion + 1}/${questions.length}`;
    questionEl.textContent = questions[currentQuestion].question;
    optionsEl.innerHTML = '';

    quizContainer.classList.add('animate__animated', 'animate__fadeIn');
    setTimeout(() => {
        quizContainer.classList.remove('animate__animated', 'animate__fadeIn');
    }, 1000);

    questions[currentQuestion].options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option animate-fadeInUp';
        button.style.animationDelay = `${index * 0.1}s`;
        button.textContent = option;
        button.addEventListener('click', () => selectOption(option, questions[currentQuestion].weights[index]));
        optionsEl.appendChild(button);
    });
}

function selectOption(selectedOption, weight) {
    score += weight;
    userAnswers.push({
        question: questions[currentQuestion].question,
        answer: selectedOption
    });

    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (option.textContent === selectedOption) {
            option.classList.add('selected');
        }
    });

    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            renderQuestion();
        } else {
            showResults();
        }
    }, 500);
}

function showResults() {
    questionEl.style.display = 'none';
    optionsEl.style.display = 'none';
    skipBtn.style.display = 'none';
    questionCounterEl.style.display = 'none';

    const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.weights), 0);
    const result = watchPersonalities.find(type =>
        score >= type.scoreRange[0] && score <= type.scoreRange[1]
    ) || watchPersonalities[0];

    quizResultsEl.innerHTML = `
        <h3>${result.name}</h3>
        <p>${result.description}</p>
        <div class="result-score">Your score: ${score}/${maxScore}</div>
        <h3>Our Recommendation</h3>
        <p>${result.recommendation}</p>
        <button class="btn-retake" id="retakeBtn">Start Over</button>
    `;
    quizResultsEl.style.display = 'block';
    quizResultsEl.classList.add('animate__animated', 'animate__fadeIn');

    document.getElementById('retakeBtn').addEventListener('click', resetQuiz);
}

function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    progressBarEl.style.width = '0%';

    questionEl.style.display = '';
    optionsEl.style.display = '';
    skipBtn.style.display = '';
    questionCounterEl.style.display = '';
    renderQuestion();
}

skipBtn.addEventListener('click', () => {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        showResults();
    }
});

renderQuestion();
