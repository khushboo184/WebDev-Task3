// Quiz Functionality
class Quiz {
    constructor() {
        this.questions = [
            {
                question: "What does CSS stand for?",
                options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
                correct: 1
            },
            {
                question: "Which JavaScript method is used to add an element to the end of an array?",
                options: ["push()", "pop()", "shift()", "unshift()"],
                correct: 0
            },
            {
                question: "What does 'responsive design' mean?",
                options: ["Fast loading websites", "Websites that adapt to different screen sizes", "Websites with animations", "Websites that respond to user input"],
                correct: 1
            },
            {
                question: "Which HTTP method is used to fetch data from an API?",
                options: ["POST", "PUT", "GET", "DELETE"],
                correct: 2
            }
        ];
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.init();
    }

    init() {
        this.renderQuestion();
        document.getElementById('submit-quiz').addEventListener('click', () => this.handleSubmit());
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        const content = document.getElementById('quiz-content');
        
        content.innerHTML = `
            <div class="question">
                <h3>Question ${this.currentQuestion + 1} of ${this.questions.length}: ${question.question}</h3>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <div class="option" data-answer="${index}">${option}</div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers to options
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedAnswer = parseInt(e.target.dataset.answer);
            });
        });
    }

    handleSubmit() {
        if (this.selectedAnswer === null) {
            alert('Please select an answer!');
            return;
        }

        if (this.selectedAnswer === this.questions[this.currentQuestion].correct) {
            this.score++;
        }

        this.currentQuestion++;
        this.selectedAnswer = null;

        if (this.currentQuestion < this.questions.length) {
            this.renderQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        const content = document.getElementById('quiz-content');
        const percentage = Math.round((this.score / this.questions.length) * 100);
        
        content.innerHTML = `
            <div class="question">
                <h3>Quiz Completed! 🎉</h3>
                <p>You scored ${this.score} out of ${this.questions.length} questions correctly!</p>
            </div>
        `;

        document.getElementById('quiz-score').textContent = `Your Score: ${percentage}%`;
        document.getElementById('submit-quiz').textContent = 'Restart Quiz';
        document.getElementById('submit-quiz').onclick = () => location.reload();
    }
}

// Carousel Functionality
class Carousel {
    constructor() {
        this.track = document.getElementById('carousel-track');
        this.slides = this.track.children;
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.init();
    }

    init() {
        this.createDots();
        this.updateCarousel();
        
        document.getElementById('prev-btn').addEventListener('click', () => this.prevSlide());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSlide());
        
        // Auto-play
        setInterval(() => this.nextSlide(), 5000);
    }

    createDots() {
        const dotsContainer = document.getElementById('carousel-dots');
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.addEventListener('click', () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    updateCarousel() {
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        
        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }
}

// API Integration
class APIManager {
    constructor() {
        this.container = document.getElementById('api-content');
        this.refreshBtn = document.getElementById('refresh-data');
        this.init();
    }

    init() {
        this.fetchData();
        this.refreshBtn.addEventListener('click', () => this.fetchData());
    }

    async fetchData() {
        this.container.innerHTML = '<div class="loading">Loading data from APIs...</div>';
        
        const dataPromises = [
            this.fetchWithFallback('weather'),
            this.fetchWithFallback('quote'),
            this.fetchWithFallback('activity')
        ];

        try {
            const results = await Promise.allSettled(dataPromises);
            const validData = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            if (validData.length === 0) {
                this.showFallbackData();
            } else {
                this.renderData(validData);
            }
        } catch (error) {
            console.error('API Error:', error);
            this.showFallbackData();
        }
    }

    async fetchWithFallback(type) {
        const apis = {
            weather: [
                () => this.fetchWeather(),
                () => this.fetchWeatherAlternative()
            ],
            quote: [
                () => this.fetchQuote(),
                () => this.fetchQuoteAlternative()
            ],
            activity: [
                () => this.fetchActivity(),
                () => this.fetchActivityAlternative()
            ]
        };

        for (const fetchFunction of apis[type]) {
            try {
                const result = await fetchFunction();
                return result;
            } catch (error) {
                console.warn(`API attempt failed for ${type}:`, error);
                continue;
            }
        }
        
        throw new Error(`All ${type} APIs failed`);
    }

    async fetchWeather() {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=26.85&longitude=80.95&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FKolkata');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const weatherCodes = {
            0: '☀️ Clear sky',
            1: '🌤️ Mainly clear',
            2: '⛅ Partly cloudy',
            3: '☁️ Overcast',
            45: '🌫️ Foggy',
            48: '🌫️ Rime fog',
            51: '🌦️ Light drizzle',
            53: '🌦️ Moderate drizzle',
            55: '🌦️ Dense drizzle',
            61: '🌧️ Slight rain',
            63: '🌧️ Moderate rain',
            65: '🌧️ Heavy rain',
            80: '🌦️ Rain showers',
            81: '🌦️ Rain showers',
            82: '🌦️ Violent rain showers',
            95: '⛈️ Thunderstorm',
            96: '⛈️ Thunderstorm with hail',
            99: '⛈️ Thunderstorm with hail'
        };

        const weatherDescription = weatherCodes[data.current.weather_code] || '🌡️ Unknown weather';
        const temp = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        
        return {
            title: '🌤️ Weather in Lucknow',
            content: `${weatherDescription}<br>Temperature: ${temp}°C<br>Humidity: ${humidity}%`
        };
    }

    async fetchWeatherAlternative() {
        // Using a different weather API as fallback
        const response = await fetch('https://api.weatherapi.com/v1/current.json?key=demo&q=Lucknow&aqi=no');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        return {
            title: '🌤️ Current Weather',
            content: `${data.current.condition.text}<br>Temperature: ${Math.round(data.current.temp_c)}°C<br>Feels like: ${Math.round(data.current.feelslike_c)}°C`
        };
    }

    async fetchQuote() {
        const response = await fetch('https://api.quotable.io/random?minLength=50&maxLength=150');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return {
            title: '💭 Inspirational Quote',
            content: `"${data.content}" - ${data.author}`
        };
    }

    async fetchQuoteAlternative() {
        const response = await fetch('https://zenquotes.io/api/random');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return {
            title: '💭 Daily Wisdom',
            content: `"${data[0].q}" - ${data[0].a}`
        };
    }

    async fetchActivity() {
        const response = await fetch('https://www.boredapi.com/api/activity');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return {
            title: '🎯 Random Activity',
            content: `${data.activity} (Type: ${data.type})`
        };
    }

    async fetchActivityAlternative() {
        const response = await fetch('https://api.adviceslip.com/advice');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return {
            title: '💡 Random Advice',
            content: data.slip.advice
        };
    }

    showFallbackData() {
        const fallbackData = [
            {
                title: '🌤️ Demo Weather',
                content: '☀️ Clear sky<br>Temperature: 28°C<br>Humidity: 65%'
            },
            {
                title: '💭 Demo Quote',
                content: '"The only way to do great work is to love what you do." - Steve Jobs'
            },
            {
                title: '🎯 Demo Activity',
                content: 'Learn a new programming language or framework today!'
            }
        ];

        this.renderData(fallbackData);
        
        // Add a note about API status
        const note = document.createElement('div');
        note.style.cssText = 'text-align: center; margin-top: 20px; color: #666; font-style: italic;';
        note.textContent = 'Note: Showing demo data. Click refresh to try loading live API data.';
        this.container.appendChild(note);
    }

    renderData(dataArray) {
        this.container.innerHTML = `
            <div class="api-data">
                ${dataArray.map(item => `
                    <div class="data-card">
                        <h3>${item.title}</h3>
                        <p>${item.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
    new Carousel();
    new APIManager();
});