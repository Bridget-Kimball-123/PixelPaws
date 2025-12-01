// ===================================
// PixelPaws - Weather & Mood System
// Author: Bridget Kimball
// ===================================

// Weather mood constants
const WEATHER_MOODS = {
    WINDY: {
        mood: 'nervous',
        background: 'linear-gradient(to bottom, #e0e0e0 0%, #f8f8f8 100%)',
        icon: '💨',
        windEffect: true,
        cheersUpWith: ['pet'],
        night: {
            background: 'linear-gradient(to bottom, #bfc6c6 0%, #e0e0e0 100%)',
            icon: '💨'
        }
    },
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
    FOGGY: {
        mood: 'nervous',
        background: 'linear-gradient(to bottom, #bfc6c6 0%, #e0e0e0 100%)',
        icon: '🌫️',
        cheersUpWith: ['pet']
    },
    STORMY: {
        mood: 'anxious',
        background: 'linear-gradient(to bottom, #2D3748 0%, #193a7dff 100%)',
        icon: '⛈️',
        recoversAfter: ['pet', 'treat', 'toy-time']
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
    },
    TORNADO: {
        mood: 'anxious',
        background: 'linear-gradient(to bottom, #a67c52 0%, #c2b280 100%)', // brown
        icon: '🌪️',
        windEffect: true,
        cheersUpWith: ['pet', 'treat', 'toy-time'],
        night: {
            background: 'linear-gradient(to bottom, #5a3a1a 0%, #a67c52 100%)',
            icon: '🌪️'
        }
    },
    HURRICANE: {
        mood: 'anxious',
        background: 'linear-gradient(to bottom, #084c61 0%, #177e89 100%)', // dark cerulean
        icon: '🌀',
        windEffect: true,
        cheersUpWith: ['pet', 'treat', 'toy-time'],
        night: {
            background: 'linear-gradient(to bottom, #052c3a 0%, #084c61 100%)',
            icon: '🌀'
        }
    },
    FROZEN_MIX: {
        mood: 'tense',
        background: 'linear-gradient(to bottom, #e0eafc 0%, #b6c6e9 100%)',
        icon: '🌨️',
        cheersUpWith: ['pet'],
        night: {
            background: 'linear-gradient(to bottom, #6b7a8f 0%, #b6c6e9 100%)',
            icon: '🌨️'
        }
    },
    HOT: {
        mood: 'hot',
        background: 'linear-gradient(to bottom, #ff512f 0%, #ff0000ff 100%)', // orange-red gradient
        icon: '🥵',
        cheersUpWith: ['brush'],
        night: {
            background: 'linear-gradient(to bottom, #9c2525ff 0%, #d47638ff 100%)',
            icon: '🥵'
        }
    },
    FREEZING: {
        mood: 'cold',
        background: 'linear-gradient(to bottom, #2a49d4ff 0%, #2eb4eeff 100%)', // dark blue gradient
        icon: '🥶',
        cheersUpWith: ['fetch'],
        night: {
            background: 'linear-gradient(to bottom, #243d8eff 0%, #3982a2ff 100%)',
            icon: '🥶'
        }
    }
};

// Mood messages for speech bubble
const MOOD_MESSAGES = {
    'nervous': ['The wind makes me nervous... 😟', 'It\'s so blustery!', 'Can you pet me to calm down?'],
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
    'sleepy': ['I\'m sleepy... 😴', 'Bedtime snack? 🍪', 'Too tired to play much...', 'Just want a toy... 💤'],
    'tense': ['Hail and sleet make me nervous... 😟', 'Frozen mix outside, can you pet me?', 'I\'m a little on edge!'],
    'hot': ['It\'s so hot! 🥵', 'I\'m overheating...', 'Can you brush me to cool off?'],
    'cold': ['It\'s freezing! 🧊', 'I\'m shivering...', 'Can we play fetch to warm me up?', 'Brrrrrrr 🥶']
};

// Weather system object
const weatherSystem = {
    currentWeather: null,
    currentMood: 'happy',
    currentTemperature: null,
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
                    this.setWeather(this.isNightTime() ? 'NIGHT' : 'SUNNY');
                }
            );
        } else {
            console.warn('Geolocation not supported. Using default weather.');
            this.setWeather(this.isNightTime() ? 'NIGHT' : 'SUNNY');
        }
    },
    
    // Fetch weather from OpenWeatherMap API
    async fetchWeather() {
        if (!this.apiKey || !this.userLocation) {
            console.log('Missing API key or location, defaulting to sunny');
            this.setWeather(this.isNightTime() ? 'NIGHT' : 'SUNNY');
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
                this.setWeather(this.isNightTime() ? 'NIGHT' : 'SUNNY');
            }
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            this.setWeather(this.isNightTime() ? 'NIGHT' : 'SUNNY');
        }
    },
    
    // Process weather data from API
    processWeatherData(data) {
        const tempK = data.main.temp;
        const tempF = (tempK - 273.15) * 9/5 + 32;
        this.currentTemperature = tempF; // Store temperature for use in other functions
        
        // Severity map: higher severity wins (used to select most impactful weather)
        const weatherSeverityMap = {
            // Extreme weather (highest priority)
            900: { type: 'TORNADO', severity: 100 },      // Tornado
            901: { type: 'TORNADO', severity: 100 },      // Tropical Storm
            902: { type: 'TORNADO', severity: 100 },      // Hurricane
            
            // Severe storms
            200: { type: 'STORMY', severity: 95 },        // Thunderstorm with light rain
            201: { type: 'STORMY', severity: 95 },        // Thunderstorm with rain
            202: { type: 'STORMY', severity: 95 },        // Thunderstorm with heavy rain
            210: { type: 'STORMY', severity: 90 },        // Light thunderstorm
            211: { type: 'STORMY', severity: 90 },        // Thunderstorm
            212: { type: 'STORMY', severity: 95 },        // Heavy thunderstorm
            221: { type: 'STORMY', severity: 95 },        // Ragged thunderstorm
            230: { type: 'STORMY', severity: 92 },        // Thunderstorm with light drizzle
            231: { type: 'STORMY', severity: 92 },        // Thunderstorm with drizzle
            232: { type: 'STORMY', severity: 95 },        // Thunderstorm with heavy drizzle
            
            // Frozen precipitation (high priority)
            906: { type: 'FROZEN_MIX', severity: 85 },    // Hail
            
            // Snow (high priority)
            600: { type: 'SNOWY', severity: 80 },         // Light snow
            601: { type: 'SNOWY', severity: 82 },         // Snow
            602: { type: 'SNOWY', severity: 84 },         // Heavy snow
            611: { type: 'FROZEN_MIX', severity: 83 },    // Sleet
            612: { type: 'FROZEN_MIX', severity: 83 },    // Light sleet
            613: { type: 'FROZEN_MIX', severity: 83 },    // Sleet
            615: { type: 'FROZEN_MIX', severity: 82 },    // Light rain and snow
            616: { type: 'FROZEN_MIX', severity: 82 },    // Rain and snow
            620: { type: 'FROZEN_MIX', severity: 81 },    // Light shower snow
            621: { type: 'FROZEN_MIX', severity: 82 },    // Shower snow
            622: { type: 'FROZEN_MIX', severity: 84 },    // Heavy shower snow
            
            // Rain (moderate priority)
            300: { type: 'RAINY', severity: 60 },         // Light drizzle
            301: { type: 'RAINY', severity: 62 },         // Drizzle
            302: { type: 'RAINY', severity: 65 },         // Heavy drizzle
            310: { type: 'RAINY', severity: 63 },         // Light rain and drizzle
            311: { type: 'RAINY', severity: 65 },         // Rain and drizzle
            312: { type: 'RAINY', severity: 68 },         // Heavy rain and drizzle
            313: { type: 'RAINY', severity: 65 },         // Shower rain and drizzle
            314: { type: 'RAINY', severity: 68 },         // Heavy shower rain and drizzle
            321: { type: 'RAINY', severity: 62 },         // Shower drizzle
            500: { type: 'RAINY', severity: 65 },         // Light rain
            501: { type: 'RAINY', severity: 70 },         // Moderate rain
            502: { type: 'RAINY', severity: 75 },         // Heavy rain
            503: { type: 'RAINY', severity: 78 },         // Very heavy rain
            504: { type: 'RAINY', severity: 80 },         // Extreme rain
            511: { type: 'FROZEN_MIX', severity: 82 },    // Freezing rain
            520: { type: 'RAINY', severity: 68 },         // Light shower rain
            521: { type: 'RAINY', severity: 72 },         // Shower rain
            522: { type: 'RAINY', severity: 76 },         // Heavy shower rain
            531: { type: 'RAINY', severity: 75 },         // Ragged shower rain
            
            // Atmosphere (low priority unless it's fog)
            701: { type: 'FOGGY', severity: 20 },         // Mist
            711: { type: 'FOGGY', severity: 25 },         // Smoke
            721: { type: 'FOGGY', severity: 22 },         // Haze
            731: { type: 'FOGGY', severity: 23 },         // Sand/dust whirls
            741: { type: 'FOGGY', severity: 30 },         // Fog
            751: { type: 'FOGGY', severity: 21 },         // Sand
            761: { type: 'FOGGY', severity: 19 },         // Dust
            762: { type: 'FOGGY', severity: 28 },         // Volcanic ash
            771: { type: 'WINDY', severity: 50 },         // Squalls
            781: { type: 'WINDY', severity: 55 },         // Tornado
            
            // Wind
            905: { type: 'WINDY', severity: 45 },         // Cool breeze
            957: { type: 'WINDY', severity: 48 },         // Strong wind
            904: { type: 'HOT', severity: 75 },           // Hot
            
            // Clouds (low priority)
            801: { type: 'CLOUDY', severity: 5 },         // Few clouds
            802: { type: 'CLOUDY', severity: 10 },        // Scattered clouds
            803: { type: 'CLOUDY', severity: 15 },        // Broken clouds
            804: { type: 'CLOUDY', severity: 18 },        // Overcast clouds
            
            // Clear/Sunny (lowest priority)
            800: { type: 'SUNNY', severity: 0 }           // Clear sky
        };
        
        // Find the most severe weather condition from all conditions in the array
        let mostSevereWeather = { type: 'SUNNY', severity: 0 };
        
        for (const condition of data.weather) {
            const weatherId = condition.id;
            const weatherMain = condition.main.toLowerCase();
            
            // Get severity for this condition
            let conditionInfo = weatherSeverityMap[weatherId];
            if (!conditionInfo) {
                // Fallback for unknown IDs based on weather main category
                if (weatherMain.includes('thunderstorm')) {
                    conditionInfo = { type: 'STORMY', severity: 90 };
                } else if (weatherMain.includes('snow')) {
                    conditionInfo = { type: 'SNOWY', severity: 80 };
                } else if (weatherMain.includes('rain')) {
                    conditionInfo = { type: 'RAINY', severity: 65 };
                } else if (weatherMain.includes('cloud')) {
                    conditionInfo = { type: 'CLOUDY', severity: 10 };
                } else {
                    conditionInfo = { type: 'SUNNY', severity: 0 };
                }
            }
            
            // Update if this condition is more severe
            if (conditionInfo.severity > mostSevereWeather.severity) {
                mostSevereWeather = conditionInfo;
            }
        }
        
        // Handle wind separately (can be combined with other weather)
        if ((data.wind && data.wind.speed >= 8) || data.weather.some(w => w.id === 905 || w.id === 957)) {
            // If wind is strong and there's nothing more severe, use WINDY
            // Otherwise, treat it as a modifier (wind + severe weather is still that severe weather)
            if (mostSevereWeather.type === 'SUNNY' || mostSevereWeather.type === 'CLOUDY') {
                mostSevereWeather = { type: 'WINDY', severity: 45 };
            }
        }
        
        // Handle temperature-based overrides (hot/freezing take priority over clear/clouds)
        if (mostSevereWeather.type === 'SUNNY' || mostSevereWeather.type === 'CLOUDY' || mostSevereWeather.type === 'NIGHT') {
            if (tempF > 80) {
                mostSevereWeather = { type: 'HOT', severity: 75 };
            } else if (tempF <= 32) {
                mostSevereWeather = { type: 'FREEZING', severity: 76 };
            }
        }
        
        // Handle night conditions (if it's night and weather is sunny/cloudy, convert to night)
        if (mostSevereWeather.type === 'SUNNY' || mostSevereWeather.type === 'CLOUDY') {
            if (this.isNightTime()) {
                mostSevereWeather = { type: 'NIGHT', severity: 2 };
            }
        }
        
        this.setWeather(mostSevereWeather.type);
    },
    
    // Set weather and determine mood
    setWeather(weatherType) {
        console.log('Setting weather to:', weatherType);
        this.currentWeather = weatherType;
        this.actionsCompleted = [];
        let weather = WEATHER_MOODS[weatherType];

        // Night alternates, but do NOT override freezing/hot
        if (this.isNightTime() && weather.night && weatherType !== 'FREEZING' && weatherType !== 'HOT') {
            weather = Object.assign({}, weather, weather.night);
        }

        // Health status always overrides weather mood
        let healthStatus = null;
        if (window.petHealth && typeof window.petHealth.getStatus === 'function') {
            healthStatus = window.petHealth.getStatus();
        }

        if (healthStatus === 'sick') {
            this.currentMood = 'sick';
        } else if (healthStatus === 'unwell') {
            this.currentMood = 'unwell';
        } else {
            if (weatherType === 'SUNNY') {
                if (window.petHealth) {
                    this.currentMood = this.weightedRandomMood(weather.moods, weather.weights);
                } else {
                    this.currentMood = weather.default;
                }
            } else if (weatherType === 'NIGHT') {
                this.currentMood = 'sleepy';
            } else if ([
                'RAINY', 'STORMY', 'SNOWY', 'FOGGY', 'CLOUDY',
                'TORNADO', 'HURRICANE', 'FROZEN_MIX', 'HOT', 'FREEZING'
            ].includes(weatherType)) {
                this.currentMood = weather.mood;
            } else {
                this.currentMood = weather.mood || 'content';
            }
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
        
        let weather = WEATHER_MOODS[this.currentWeather];
        // Night alternates
        if (this.isNightTime() && weather.night) {
            weather = Object.assign({}, weather, weather.night);
        }
        // Set background
        petDisplay.style.background = weather.background;
        // Set weather icon
        weatherEffects.innerHTML = `<div class="weather-icon">${weather.icon}</div>`;

        // Remove previous stars, rain, snow, storm, wind, hail effects
        const starBg = document.querySelector('.star-bg');
        if (starBg) starBg.innerHTML = '';
        document.querySelectorAll('.rain-emoji, .snow-emoji, .lightning-emoji, .wind-emoji, .hail-emoji, .sleet-emoji').forEach(e => e.remove());
        petDisplay.classList.remove('mist-effect');

        // Show stars whenever it's nighttime, regardless of weather
        if (this.isNightTime()) {
            if (starBg) {
                for (let i = 0; i < 50; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.style.top = Math.random() * 100 + '%';
                    star.style.left = Math.random() * 100 + '%';
                    star.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
                    starBg.appendChild(star);
                }
            }
        }

        // Effect overview
        if (this.currentWeather === 'NIGHT') {
            // Night mood is handled above with stars
        } else if (this.currentWeather === 'SNOWY') {
            for (let i = 0; i < 12; i++) {
                const snow = document.createElement('div');
                snow.className = 'snow-emoji';
                snow.textContent = '❄️';
                snow.style.left = Math.random() * 95 + '%';
                snow.style.animationDelay = (Math.random() * 2) + 's';
                petDisplay.appendChild(snow);
            }
        } else if (this.currentWeather === 'RAINY') {
            for (let i = 0; i < 12; i++) {
                const rain = document.createElement('div');
                rain.className = 'rain-emoji';
                rain.textContent = '💧';
                rain.style.left = Math.random() * 95 + '%';
                rain.style.animationDelay = (Math.random() * 2) + 's';
                petDisplay.appendChild(rain);
            }
        } else if (this.currentWeather === 'STORMY') {
            for (let i = 0; i < 6; i++) {
                const lightning = document.createElement('div');
                lightning.className = 'lightning-emoji';
                lightning.textContent = '⚡';
                lightning.style.left = Math.random() * 95 + '%';
                lightning.style.animationDelay = (Math.random() * 2) + 's';
                lightning.style.position = 'absolute';
                lightning.style.top = (10 + Math.random() * 60) + '%';
                lightning.style.fontSize = '40px';
                lightning.style.opacity = '0.7';
                petDisplay.appendChild(lightning);
            }
        } else if (this.currentWeather === 'FOGGY') {
            petDisplay.classList.add('mist-effect');
        } else if (this.currentWeather === 'TORNADO') {
            for (let i = 0; i < 8; i++) {
                const wind = document.createElement('div');
                wind.className = 'wind-emoji';
                wind.textContent = '💨';
                wind.style.left = Math.random() * 95 + '%';
                wind.style.animationDelay = (Math.random() * 2) + 's';
                wind.style.position = 'absolute';
                wind.style.top = (10 + Math.random() * 80) + '%';
                wind.style.fontSize = '32px';
                wind.style.opacity = '0.7';
                petDisplay.appendChild(wind);
            }
        } else if (this.currentWeather === 'HURRICANE') {
            for (let i = 0; i < 8; i++) {
                const wind = document.createElement('div');
                wind.className = 'wind-emoji';
                wind.textContent = '💨';
                wind.style.left = Math.random() * 95 + '%';
                wind.style.animationDelay = (Math.random() * 2) + 's';
                wind.style.position = 'absolute';
                wind.style.top = (10 + Math.random() * 80) + '%';
                wind.style.fontSize = '32px';
                wind.style.opacity = '0.7';
                petDisplay.appendChild(wind);
            }
        } else if (this.currentWeather === 'FROZEN_MIX') {
            for (let i = 0; i < 8; i++) {
                const hail = document.createElement('div');
                hail.className = 'hail-emoji';
                hail.textContent = '🧊';
                hail.style.left = Math.random() * 95 + '%';
                hail.style.animationDelay = (Math.random() * 2) + 's';
                hail.style.position = 'absolute';
                hail.style.top = (10 + Math.random() * 80) + '%';
                hail.style.fontSize = '28px';
                hail.style.opacity = '0.7';
                petDisplay.appendChild(hail);
            }
            for (let i = 0; i < 6; i++) {
                const sleet = document.createElement('div');
                sleet.className = 'sleet-emoji';
                sleet.textContent = '❄️';
                sleet.style.left = Math.random() * 95 + '%';
                sleet.style.animationDelay = (Math.random() * 2) + 's';
                sleet.style.position = 'absolute';
                sleet.style.top = (10 + Math.random() * 80) + '%';
                sleet.style.fontSize = '22px';
                sleet.style.opacity = '0.7';
                petDisplay.appendChild(sleet);
            }
        } else if (this.currentWeather === 'HOT') {
            // Show pet face with semi-transparent red overlay (40% opacity)
            const petFace = document.querySelector('.pet-display .pet .face');
            if (petFace) {
                // Remove previous overlays
                const oldHotOverlay = petFace.querySelector('.hot-overlay');
                if (oldHotOverlay) oldHotOverlay.remove();
                
                // Add semi-transparent red overlay
                const hotOverlay = document.createElement('div');
                hotOverlay.className = 'hot-overlay';
                hotOverlay.style.position = 'absolute';
                hotOverlay.style.top = '0';
                hotOverlay.style.left = '0';
                hotOverlay.style.width = '100%';
                hotOverlay.style.height = '100%';
                hotOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'; // 40% opacity red
                hotOverlay.style.borderRadius = '50%';
                hotOverlay.style.pointerEvents = 'none';
                hotOverlay.style.zIndex = '10';
                petFace.appendChild(hotOverlay);
            }
        } else if (this.currentWeather === 'FREEZING') {
            // Make entire pet blue and add shivering animation
            const pet = document.querySelector('.pet-display .pet');
            const petFace = document.querySelector('.pet-display .pet .face');
            const petBody = document.querySelector('.pet-display .pet .body');
            
            if (pet) {
                // Add shivering animation to the entire pet
                pet.style.animation = 'shiver 0.1s infinite';
            }
            
            if (petFace) {
                // Remove previous overlays
                const oldColdOverlay = petFace.querySelector('.cold-overlay');
                if (oldColdOverlay) oldColdOverlay.remove();
                
                // Add semi-transparent blue overlay to entire face
                const coldOverlay = document.createElement('div');
                coldOverlay.className = 'cold-overlay';
                coldOverlay.style.position = 'absolute';
                coldOverlay.style.top = '0';
                coldOverlay.style.left = '0';
                coldOverlay.style.width = '100%';
                coldOverlay.style.height = '100%';
                coldOverlay.style.backgroundColor = 'rgba(30, 136, 229, 0.6)'; // More opaque blue
                coldOverlay.style.borderRadius = '50%';
                coldOverlay.style.pointerEvents = 'none';
                coldOverlay.style.zIndex = '10';
                petFace.appendChild(coldOverlay);
            }
            
            if (petBody) {
                // Remove previous overlays
                const oldBellyOverlay = petBody.querySelector('.cold-belly-overlay');
                if (oldBellyOverlay) oldBellyOverlay.remove();
                
                // Add semi-transparent blue overlay to belly/body
                const bellyOverlay = document.createElement('div');
                bellyOverlay.className = 'cold-belly-overlay';
                bellyOverlay.style.position = 'absolute';
                bellyOverlay.style.top = '0';
                bellyOverlay.style.left = '0';
                bellyOverlay.style.width = '100%';
                bellyOverlay.style.height = '100%';
                bellyOverlay.style.backgroundColor = 'rgba(30, 136, 229, 0.6)'; // More opaque blue
                bellyOverlay.style.borderRadius = '50%';
                bellyOverlay.style.pointerEvents = 'none';
                bellyOverlay.style.zIndex = '10';
                petBody.style.position = 'relative';
                petBody.appendChild(bellyOverlay);
            }
            
            // Remove old icicles if they exist
            document.querySelectorAll('.icicle').forEach(i => i.remove());
        } else if (this.currentWeather === 'WINDY') {
            // Remove overlays if not hot/freezing
            const petFace = document.querySelector('.pet-display .pet .face');
            if (petFace) {
                petFace.style.backgroundColor = '';
                const oldHotOverlay = petFace.querySelector('.hot-overlay');
                if (oldHotOverlay) oldHotOverlay.remove();
                const oldColdOverlay = petFace.querySelector('.cold-overlay');
                if (oldColdOverlay) oldColdOverlay.remove();
            }
            for (let i = 0; i < 8; i++) {
                const wind = document.createElement('div');
                wind.className = 'wind-emoji';
                wind.textContent = '💨';
                wind.style.left = Math.random() * 95 + '%';
                wind.style.animationDelay = (Math.random() * 2) + 's';
                wind.style.position = 'absolute';
                wind.style.top = (10 + Math.random() * 80) + '%';
                wind.style.fontSize = '32px';
                wind.style.opacity = '0.7';
                petDisplay.appendChild(wind);
            }
        } else {
            // Remove overlays for all other weather types
            const petFace = document.querySelector('.pet-display .pet .face');
            if (petFace) {
                petFace.style.backgroundColor = '';
                const oldHotOverlay = petFace.querySelector('.hot-overlay');
                if (oldHotOverlay) oldHotOverlay.remove();
                const oldColdOverlay = petFace.querySelector('.cold-overlay');
                if (oldColdOverlay) oldColdOverlay.remove();
            }
        }
    },
    
    // Update mood speech bubble
    updateMoodSpeechBubble() {
        if (!window.petHealth) return;
        
        // Override messages if freezing weather with temperature below 32F
        const freezingMessages = [
            'I\'m so cold! 🥶',
            'I\'m shivering! Brrr...',
            'Please help me warm up...',
            'It\'s freezing! 🧊',
            'I\'m frozen! Can we play to warm up?',
            'S-s-so c-cold! 🥶',
            'Everything is icy... I need warmth!',
            'Can\'t you feel how cold it is?'
        ];
        
        let messages;
        if (this.currentWeather === 'FREEZING' && this.currentTemperature <= 32) {
            messages = freezingMessages;
        } else {
            messages = MOOD_MESSAGES[this.currentMood];
        }
        
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
            // ...existing code...
        } else if (this.currentWeather === 'NIGHT') {
            // ...existing code...
        } else if (this.currentWeather === 'RAINY') {
            // ...existing code...
        } else if (this.currentWeather === 'STORMY') {
            // ...existing code...
        } else if (this.currentWeather === 'SNOWY') {
            // ...existing code...
        } else if (this.currentWeather === 'FOGGY') {
            // ...existing code...
        } else if (this.currentWeather === 'TORNADO' || this.currentWeather === 'HURRICANE') {
            // Anxious: cheers up with pet, treat, toy-time
            if (weather.cheersUpWith.includes(actionType)) {
                this.currentMood = 'happy';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'FROZEN_MIX') {
            // Nervous: cheers up with pet
            if (weather.cheersUpWith.includes(actionType)) {
                this.currentMood = 'happy';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'HOT') {
            // Hot: cheers up with brush
            if (weather.cheersUpWith.includes(actionType)) {
                this.currentMood = 'happy';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'FREEZING') {
            // Cold: cheers up with fetch
            if (weather.cheersUpWith.includes(actionType)) {
                this.currentMood = 'happy';
                this.updateMoodSpeechBubble();
            }
        } else if (this.currentWeather === 'WINDY') {
            // Windy: cheers up with pet
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
