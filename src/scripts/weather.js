// ===================================
// PixelPaws - Weather & Mood System
// Author: Bridget Kimball
// ===================================

// Weather mood constants
const WEATHER_MOODS = {
    SUNNY: {
        moods: ['happy', 'hungry', 'wants-love', 'wants-toy', 'wants-play'],
        weights: [0.5, 0.15, 0.15, 0.1, 0.1], // Happy has 50% weight
        default: 'happy',
        background: 'linear-gradient(to bottom, #87CEEB 0%, #FFE66D 100%)',
        icon: '☀️'
    },
    RAINY: {
        mood: 'sad',
        background: 'linear-gradient(to bottom, #003e80ff 0%, #003facff 100%)',
        icon: '🌧️',
        cheersUpWith: ['fetch', 'toy-time']
    },
    STORMY: {
        mood: 'anxious',
        background: 'linear-gradient(to bottom, #2D3748 0%, #193a7dff 100%)',
        icon: '⛈️',
        recoversAfter: ['pet', 'treat']
    },
    SNOWY: {
        mood: 'wants-play',
        background: 'linear-gradient(to bottom, #ffffffff 0%, #CBD5E0 100%)',
        icon: '❄️',
        cheersUpWith: ['fetch', 'toy-time']
    },
    CLOUDY: {
        mood: 'content',
        background: 'linear-gradient(to bottom, #a9b2bcff 0%, #929eafff 100%)',
        icon: '☁️'
    },
    NIGHT: {
        mood: 'sleepy',
        background: 'linear-gradient(to bottom, #1A202C 0%, #2D3748 100%)',
        icon: '🌙',
        cheersUpWith: ['treat', 'toy-time'] // Only wants treats and toys when sleepy
    }
};

// Mood messages for speech bubble
const MOOD_MESSAGES = {
    'happy': ['I\'m so happy! 😊', 'What a great day!', 'Life is good! ✨'],
    'hungry': ['I\'m hungry! 🍖', 'Feed me please!', 'My tummy is rumbling...'],
    'wants-love': ['I need some love! 💕', 'Pet me please!', 'Can I have cuddles?'],
    'wants-toy': ['I want to play with a toy! 🎾', 'Toy time?', 'Can I have a new toy?'],
    'wants-play': ['Let\'s play! 🎮', 'Play with me!', 'I want to have fun!'],
    'sad': ['I\'m feeling sad... 😢', 'The rain makes me blue...', 'Cheer me up?'],
    'anxious': ['I\'m scared! 😰', 'The storm is scary...', 'Hold me please...'],
    'content': ['I\'m feeling okay', 'Just relaxing...', 'Taking it easy'],
    'sick': ['I don\'t feel well... 🤒', 'I need care...', 'Not feeling good...'],
    'unwell': ['I\'m not feeling great... 😔', 'Could use some attention...', 'Feeling a bit off...'],
    'sleepy': ['I\'m sleepy... 😴', 'Bedtime snack? 🍪', 'Too tired to play much...', 'Just want a toy... 💤']
};

// Weather system object
const weatherSystem = {
    currentWeather: null,
    currentMood: 'happy',
    apiKey: 'd75401fa67edb5c4f5e2689ef918636d', // OpenWeatherMap API key
    userLocation: null,
    actionsCompleted: [],
    
    // Initialize weather system
    init() {
        console.log('Weather system initializing...');
        console.log('API Key:', this.apiKey ? 'Set' : 'Missing');
        this.getUserLocation();
        
        // Update weather every 30 minutes
        setInterval(() => {
            if (this.apiKey && this.userLocation) {
                this.fetchWeather();
            }
        }, 30 * 60 * 1000);
    },
    
    // Check if it's night time (between 8 PM and 6 AM)
    isNightTime() {
        const hour = new Date().getHours();
        return hour >= 20 || hour < 6;
    },
    
    // Get user's location
    getUserLocation() {
        console.log('Requesting user location...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    console.log('Location acquired:', this.userLocation);
                    this.fetchWeather();
                },
                (error) => {
                    console.warn('Location access denied. Using default weather.', error);
                    this.setWeather('SUNNY');
                }
            );
        } else {
            console.warn('Geolocation not supported. Using default weather.');
            this.setWeather('SUNNY');
        }
    },
    
    // Fetch weather from OpenWeatherMap API
    async fetchWeather() {
        if (!this.apiKey || !this.userLocation) {
            console.log('Missing API key or location, defaulting to sunny');
            this.setWeather('SUNNY');
            return;
        }
        
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.userLocation.lat}&lon=${this.userLocation.lon}&appid=${this.apiKey}`;
            console.log('Fetching weather from:', url);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Weather API response:', data);
            
            if (data.cod === 200) {
                this.processWeatherData(data);
            } else {
                console.error('Weather API error:', data.message);
                this.setWeather('SUNNY');
            }
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            this.setWeather('SUNNY');
        }
    },
    
    // Process weather data from API
    processWeatherData(data) {
        // Check if it's night time first
        if (this.isNightTime()) {
            this.setWeather('NIGHT');
            return;
        }
        
        const weatherId = data.weather[0].id;
        const main = data.weather[0].main.toLowerCase();
        
        // Map weather conditions to our weather types
        if (weatherId >= 200 && weatherId < 300) {
            // Thunderstorm
            this.setWeather('STORMY');
        } else if (weatherId >= 300 && weatherId < 600) {
            // Drizzle/Rain
            this.setWeather('RAINY');
        } else if (weatherId >= 600 && weatherId < 700) {
            // Snow
            this.setWeather('SNOWY');
        } else if (weatherId >= 801 && weatherId <= 804) {
            // Clouds
            this.setWeather('CLOUDY');
        } else if (weatherId === 800) {
            // Clear/Sunny
            this.setWeather('SUNNY');
        } else {
            // Default to cloudy for other conditions
            this.setWeather('CLOUDY');
        }
    },
    
    // Set weather and determine mood
    setWeather(weatherType) {
        console.log('Setting weather to:', weatherType);
        this.currentWeather = weatherType;
        this.actionsCompleted = []; // Reset actions when weather changes
        
        const weather = WEATHER_MOODS[weatherType];
        
        // Determine mood based on weather
        if (weatherType === 'SUNNY') {
            // For sunny weather, check health status first
            if (window.petHealth) {
                const status = window.petHealth.getStatus();
                if (status === 'sick') {
                    this.currentMood = 'sick';
                } else if (status === 'unwell') {
                    this.currentMood = 'unwell';
                } else {
                    // Randomly pick mood with weights
                    this.currentMood = this.weightedRandomMood(weather.moods, weather.weights);
                }
            } else {
                this.currentMood = weather.default;
            }
        } else if (weatherType === 'NIGHT') {
            // At night, pet is sleepy
            this.currentMood = 'sleepy';
        } else if (weatherType === 'RAINY' || weatherType === 'STORMY' || weatherType === 'SNOWY') {
            this.currentMood = weather.mood;
        } else {
            this.currentMood = weather.mood || 'content';
        }
        
        this.updateWeatherDisplay();
        this.updateMoodSpeechBubble();
    },
    
    // Weighted random selection for sunny moods
    weightedRandomMood(moods, weights) {
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < moods.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return moods[i];
            }
        }
        
        return moods[0]; // Fallback
    },
    
    // Update weather display (background and icon)
    updateWeatherDisplay() {
        const petDisplay = document.querySelector('.pet-display');
        const weatherEffects = document.querySelector('.weather-effects');
        
        console.log('Updating weather display...');
        console.log('Pet display element:', petDisplay);
        console.log('Weather effects element:', weatherEffects);
        
        if (!petDisplay || !weatherEffects) {
            console.error('Could not find pet-display or weather-effects elements');
            return;
        }
        
        const weather = WEATHER_MOODS[this.currentWeather];
        console.log('Applying weather:', this.currentWeather, weather);
        
        // Set background
        petDisplay.style.background = weather.background;
        console.log('Background set to:', weather.background);
        
        // Set weather icon
        weatherEffects.innerHTML = `<div class="weather-icon">${weather.icon}</div>`;
        console.log('Weather icon added');
    },
    
    // Update mood speech bubble
    updateMoodSpeechBubble() {
        if (!window.petHealth) return;
        
        const messages = MOOD_MESSAGES[this.currentMood];
        if (messages) {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            // Update the speech bubble if updateSpeechBubble method exists
            if (typeof window.petHealth.updateSpeechBubble === 'function') {
                // Store the message temporarily for the speech bubble to use
                window.petHealth.customMoodMessage = randomMessage;
                window.petHealth.updateSpeechBubble();
            }
        }
    },
    
    // Handle action completion
    handleAction(actionType) {
        const weather = WEATHER_MOODS[this.currentWeather];
        
        // Track completed action
        if (!this.actionsCompleted.includes(actionType)) {
            this.actionsCompleted.push(actionType);
        }
        
        // Check if mood should change based on weather type
        if (this.currentWeather === 'SUNNY') {
            // Sunny weather: specific actions make pet happy
            if ((this.currentMood === 'hungry' && (actionType === 'feed' || actionType === 'treat')) ||
                (this.currentMood === 'wants-love' && actionType === 'pet') ||
                (this.currentMood === 'wants-toy' && actionType === 'toy-time') ||
                (this.currentMood === 'wants-play' && (actionType === 'fetch' || actionType === 'toy-time'))) {
                this.currentMood = 'happy';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'NIGHT') {
            // Night time: only treats and toys cheer up the sleepy pet
            if (weather.cheersUpWith.includes(actionType)) {
                this.currentMood = 'content';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'RAINY') {
            // Rainy: cheers up after playing
            if (weather.cheersUpWith.includes(actionType)) {
                this.currentMood = 'happy';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'STORMY') {
            // Stormy: needs both pet AND treat
            if (this.actionsCompleted.includes('pet') && this.actionsCompleted.includes('treat')) {
                this.currentMood = 'content';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'SNOWY') {
            // Snowy: wants to play
            if (weather.cheersUpWith.includes(actionType)) {
                this.currentMood = 'happy';
                this.updateMoodSpeechBubble();
            }
        }
    },
    
    // Get current mood
    getCurrentMood() {
        return this.currentMood;
    },
    
    // Get current weather
    getCurrentWeather() {
        return this.currentWeather;
    }
};

// Initialize weather system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on play page
    if (document.querySelector('.pet-display')) {
        weatherSystem.init();
    }
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.weatherSystem = weatherSystem;
}
