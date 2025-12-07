// ===================================
// PixelPaws - Health Tracking System
// Author: Bridget Kimball
// ===================================

// Health status constants
const HEALTH_STATUS = {
    HEALTHY: 'healthy',
    UNWELL: 'unwell',
    SICK: 'sick'
};

// Health tracking object
const petHealth = {
    lastVisit: null,
    status: HEALTH_STATUS.HEALTHY,
    hunger: 100,
    happiness: 100,
    activeStartTime: null, // Track when page became active
    isTabVisible: true, // Track if tab is currently visible
    
    // Actions completed for recovery
    recovery: {
        fed: false,
        played: false,
        petted: false,
        brushed: false,
        givenToy: false
    },
    
    // Initialize health system
    init() {
        this.loadHealthData();
        this.checkHealthStatus(); // Check status based on time away
        this.updateHealthDisplay();
        this.updateSpeechBubble();
        this.activeStartTime = Date.now(); // Start tracking active time
        this.setupVisibilityTracking(); // Track when tab is visible/hidden
        this.startIdleDecay();
        // Update last visit AFTER checking status to preserve decay between page loads
        this.updateLastVisit();
    },
    
    // Setup visibility tracking to detect when tab is hidden
    setupVisibilityTracking() {
        // Check if Page Visibility API is supported
        if (typeof document.hidden !== "undefined") {
            document.addEventListener("visibilitychange", () => {
                this.isTabVisible = !document.hidden;
                console.log('Tab visibility changed:', this.isTabVisible ? 'visible' : 'hidden');
            });
        }
    },
    
    // Load health data from localStorage
    loadHealthData() {
        const savedData = localStorage.getItem('petHealthData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.lastVisit = data.lastVisit;
            this.status = data.status || HEALTH_STATUS.HEALTHY;
            // Use proper null/undefined checks instead of || to avoid treating 0 as falsy
            this.hunger = (data.hunger !== undefined && data.hunger !== null) ? data.hunger : 100;
            this.happiness = (data.happiness !== undefined && data.happiness !== null) ? data.happiness : 100;
            this.recovery = data.recovery || this.recovery;
        } else {
            // First visit
            this.lastVisit = Date.now();
            this.saveHealthData();
        }
    },
    
    // Save health data to localStorage
    saveHealthData() {
        const data = {
            lastVisit: this.lastVisit,
            status: this.status,
            hunger: this.hunger,
            happiness: this.happiness,
            recovery: this.recovery
        };
        localStorage.setItem('petHealthData', JSON.stringify(data));
    },
    
    // Update last visit timestamp
    updateLastVisit() {
        this.lastVisit = Date.now();
        this.saveHealthData();
    },
    
    // Check health status based on time away
    checkHealthStatus() {
        const currentTime = Date.now();
        const timeAway = currentTime - this.lastVisit;
        
        // Apply continuous decay for any time away (more than 1 minute to avoid page navigation drops)
        if (timeAway > 60000) { // 60000ms = 1 minute
            const minutesAway = timeAway / (60 * 1000);
            
            let hungerDecay = 0;
            let happinessDecay = 0;
            
            if (minutesAway <= 10) {
                // First 10 minutes: Faster decay (0.5% hunger/min, 0.45% happiness/min)
                hungerDecay = minutesAway * 0.05;
                happinessDecay = minutesAway * 0.045;
            } else {
                // After 10 minutes: Slower decay rate
                hungerDecay = 10 * 0.001;
                happinessDecay = 10 * 0.001;
            }
            
            this.hunger = Math.max(0, this.hunger - hungerDecay);
            this.happiness = Math.max(0, this.happiness - happinessDecay);
        }
        
        // Update status based on current health levels
        this.updateStatusBasedOnLevels();
        
        this.saveHealthData();
    },
    
    // Reset recovery actions
    resetRecoveryActions() {
        this.recovery = {
            fed: false,
            played: false,
            petted: false,
            brushed: false,
            givenToy: false
        };
    },
    
    // Perform action and update health
    performAction(action) {
        console.log('performAction called with:', action);
        console.log('Before - Hunger:', this.hunger, 'Happiness:', this.happiness);
        
        switch(action) {
            case 'feed':
                this.recovery.fed = true;
                // Feed increases hunger by 10%
                this.hunger = Math.min(100, this.hunger + 10);
                break;
            case 'treat':
                // Treat increases hunger by 5%
                this.hunger = Math.min(100, this.hunger + 5);
                break;
            case 'fetch':
                this.recovery.played = true;
                // Fetch increases happiness by 15%
                this.happiness = Math.min(100, this.happiness + 15);
                break;
            case 'pet':
                this.recovery.petted = true;
                // Pet increases happiness by 5%
                this.happiness = Math.min(100, this.happiness + 5);
                break;
            case 'brush':
                this.recovery.brushed = true;
                // Brush increases happiness by 5%
                this.happiness = Math.min(100, this.happiness + 5);
                break;
            case 'toy':
                this.recovery.givenToy = true;
                // Toy time increases happiness by 5%
                this.happiness = Math.min(100, this.happiness + 5);
                break;
            default:
                // Other actions give small happiness boost
                this.happiness = Math.min(100, this.happiness + 1);
        }
        
        console.log('After - Hunger:', this.hunger, 'Happiness:', this.happiness);
        
        this.checkRecovery();
        this.updateStatusBasedOnLevels(); // Check if status should change based on current levels
        this.saveHealthData();
        this.updateHealthDisplay();
        this.updateSpeechBubble();
    },
    
    // Update status based on current hunger/happiness levels
    updateStatusBasedOnLevels() {
        const avgHealth = this.getHealthPercentage(); // Use weighted calculation
        
        // If health is good (60%+), status is HEALTHY
        if (avgHealth >= 60 && this.status !== HEALTH_STATUS.HEALTHY) {
            this.status = HEALTH_STATUS.HEALTHY;
            this.resetRecoveryActions();
            console.log('Status upgraded to HEALTHY');
        }
        // If health is moderate (30-59%), status is UNWELL (orange)
        else if (avgHealth >= 30 && avgHealth < 60) {
            if (this.status !== HEALTH_STATUS.UNWELL) {
                this.status = HEALTH_STATUS.UNWELL;
                this.resetRecoveryActions();
                console.log('Status changed to UNWELL');
            }
        }
        // If health is low (<30%), status is SICK (red)
        else if (avgHealth < 30 && this.status !== HEALTH_STATUS.SICK) {
            this.status = HEALTH_STATUS.SICK;
            this.resetRecoveryActions();
            console.log('Status downgraded to SICK');
        }
    },
    
    // Check if pet has recovered
    checkRecovery() {
        if (this.status === HEALTH_STATUS.UNWELL) {
            // Need to be fed and played with
            if (this.recovery.fed && this.recovery.played) {
                this.status = HEALTH_STATUS.HEALTHY;
                // Don't reset hunger/happiness to 100% - keep current values
                showNotification('Your pet is healthy again! 🎉');
            }
        } else if (this.status === HEALTH_STATUS.SICK) {
            // Need all 5 actions
            if (this.recovery.fed && this.recovery.played && this.recovery.petted && 
                this.recovery.brushed && this.recovery.givenToy) {
                this.status = HEALTH_STATUS.HEALTHY;
                // Don't reset hunger/happiness to 100% - keep current values
                showNotification('Your pet has fully recovered! 🌟');
            }
        }
    },
    
    // Get health percentage (weighted average of hunger and happiness)
    getHealthPercentage() {
        // New weighted calculation:
        // If one (hunger/happiness) is below 30 and the other is above 75, weigh the 30 more
        let hunger = this.hunger;
        let happiness = this.happiness;
        
        // Check if one is below 30 and the other is above 75
        if (hunger < 30 && happiness > 75) {
            // Weigh hunger more heavily (give it double weight)
            return Math.round((hunger * 2 + happiness) / 3);
        }
        if (happiness < 30 && hunger > 75) {
            // Weigh happiness more heavily (give it double weight)
            return Math.round((happiness * 2 + hunger) / 3);
        }
        
        // Otherwise, return simple average
        return Math.round((hunger + happiness) / 2);
    },
    
    // Get health color based on hunger/happiness thresholds
    getHealthColor() {
        // If either hunger or happiness is below 20%, return red
        if (this.hunger < 20 || this.happiness < 20) {
            return '#F44336'; // Red
        }
        
        // If either hunger or happiness is below 50%, return orange
        if (this.hunger < 50 || this.happiness < 50) {
            return '#FF9800'; // Orange
        }
        
        // Otherwise, return green (both above 50%)
        return '#367C3C'; // Green
    },
    
    // Update health bar display
    updateHealthDisplay() {
        const healthBar = document.querySelector('.health-bar');
        if (!healthBar) return;
        
        const healthPercentage = this.getHealthPercentage();
        const healthColor = this.getHealthColor();
        
        // Update the bar chart data - use a simple div-based progress bar
        const barWrapper = healthBar.querySelector('.peity-bar-wrapper');
        const barSpan = healthBar.querySelector('.peity-bar');
        
        if (barSpan && barWrapper) {
            // Remove any existing SVG from Peity
            const existingSvg = barSpan.querySelector('svg');
            if (existingSvg) {
                existingSvg.remove();
            }
            
            // Create a simple horizontal progress bar with div
            barSpan.innerHTML = `<div class="health-bar-fill" style="width: ${healthPercentage}%; background-color: ${healthColor}; height: 30px; transition: width 0.3s ease, background-color 0.3s ease; border-radius: 3px;"></div>`;
        }
        
        // Update text labels with one decimal place for precision
        const statusText = healthBar.querySelector('.health-status');
        const hungerText = healthBar.querySelector('.hunger-level');
        const happinessText = healthBar.querySelector('.happiness-level');
        
        if (statusText) {
            statusText.textContent = this.status.charAt(0).toUpperCase() + this.status.slice(1);
            statusText.style.color = healthColor;
        }
        if (hungerText) hungerText.textContent = `Hunger: ${this.hunger.toFixed(1)}%`;
        if (happinessText) happinessText.textContent = `Happiness: ${this.happiness.toFixed(1)}%`;
        
        // Update mood based on health and weather
        this.updateMood();
    },
    
    // Update speech bubble based on health status
    updateSpeechBubble() {
        const speechBubble = document.querySelector('.speech-bubble p');
        if (!speechBubble) return;
        
        let message = '';
        
        // Check if weather system has a custom mood message
        if (this.customMoodMessage) {
            message = this.customMoodMessage;
            this.customMoodMessage = null; // Clear after use
        } else if (this.status === HEALTH_STATUS.SICK) {
            const messages = [
                "I'm not feeling well... 🤒",
                "I need the best medicine, your love... 💔",
                "Please help me get healthy again! 🏥",
                "I'm so sick... 🤮",
                "I feel terrible... please help me... 😭"
            ];
            message = messages[Math.floor(Math.random() * messages.length)];
        } else if (this.status === HEALTH_STATUS.UNWELL) {
            const messages = [
                "I'm hungry and bored... 😔",
                "I need food and playtime! 🍖🎾",
                "Please feed and play with me! 🥺",
                "I'm feeling neglected... Feed me and let's play! 💙",
                "I'm not feeling great... 😟"
            ];
            message = messages[Math.floor(Math.random() * messages.length)];
        } else {
            // Healthy - check weather for mood
            const weather = this.getWeather();
            if (weather === 'night') {
                const messages = [
                    "I'm sleepy... 😴",
                    "Bedtime snack? 🍪",
                    "Too tired to play much... 💤",
                    "Just want a treat or toy... 🌙",
                    "Time for bed soon... ⭐"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else if (weather === 'rainy') {
                const messages = [
                    "It's raining... I'm a bit sad 🌧️",
                    "The rain makes me feel blue... 🔵",
                    "I don't like the rain much... 😔",
                    "Play with me to cheer me up! 😢",
                    "It's too rainy outside... can we stay in? ☔️"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else if (weather === 'snowy') {
                const messages = [
                    "Snow! Let's play! ❄️",
                    "Do you want to build a snowman? ⛄",
                    "Snow day fun! 🛷",
                    "I'm wishing for a winter wonderland! 🌨️",
                    "It's beginning to look a lot like Christmas! 🎄"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else if (weather === 'stormy') {
                const messages = [
                    "The storm scares me... 😬",
                    "I'm scared! Hold me! ⛈️",
                    "Thunder is so scary! 😨",
                    "I need your comfort during this storm... 🌩️",
                    "I don't like storms... can we cuddle? 🚫⚡️"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else {
                // Sunny or default - happy messages
                const messages = [
                    "I'm so happy today! 😊",
                    "What a beautiful day! ☀️",
                    "I love sunny days! 🌞",
                    "Let's play together! 🎉",
                    "The sun is shining so I'm shining ✨"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            }
        }
        
        speechBubble.textContent = message;
    },
    
    // Get current weather from pet display class
    getWeather() {
        const petDisplay = document.querySelector('.pet-display');
        if (!petDisplay) return 'sunny';
        
        // Check if it's night time (same logic as weather.js)
        const hour = new Date().getHours();
        if (hour >= 20 || hour < 6) return 'night';
        
        if (petDisplay.classList.contains('rainy')) return 'rainy';
        if (petDisplay.classList.contains('snowy')) return 'snowy';
        if (petDisplay.classList.contains('stormy')) return 'stormy';
        return 'sunny';
    },
    
    // Update mood display based on health status and weather
    updateMood() {
        const moodElement = document.querySelector('.pet-mood span');
        if (!moodElement) return;
        
        let mood = '';
        
        // Health status overrides weather mood
        if (this.status === HEALTH_STATUS.SICK) {
            mood = 'Depressed';
        } else if (this.status === HEALTH_STATUS.UNWELL) {
            mood = 'Unhappy';
        } else {
            // Healthy - check weather for mood
            const weather = this.getWeather();
            if (weather === 'rainy') {
                mood = 'Sad';
            } else if (weather === 'snowy') {
                mood = 'Playful';
            } else if (weather === 'stormy') {
                mood = 'Anxious';
            } else {
                mood = 'Happy';
            }
        }
        
        moodElement.textContent = mood;
    },
    
    // Get required actions for recovery
    getRequiredActions() {
        if (this.status === HEALTH_STATUS.UNWELL) {
            const needed = [];
            if (!this.recovery.fed) needed.push('Feed');
            if (!this.recovery.played) needed.push('Play Fetch');
            return needed;
        } else if (this.status === HEALTH_STATUS.SICK) {
            const needed = [];
            if (!this.recovery.fed) needed.push('Feed');
            if (!this.recovery.played) needed.push('Play Fetch');
            if (!this.recovery.petted) needed.push('Pet');
            if (!this.recovery.brushed) needed.push('Brush');
            if (!this.recovery.givenToy) needed.push('Give Toy');
            return needed;
        }
        return [];
    },
    
    // Start idle decay - health decreases slowly over time
    startIdleDecay() {
        // Decay every 30 seconds while on the page
        setInterval(() => {
            if (this.hunger > 0 || this.happiness > 0) {
                // Desktop detection
                const isDesktop = !/Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
                const activeTime = Date.now() - this.activeStartTime;
                const minutesActive = activeTime / (60 * 1000);
                let hungerDecayRate, happinessDecayRate;
                if (isDesktop) {
                    // Desktop: much slower decay
                    if (minutesActive <= 15) {
                        hungerDecayRate = 0.1; // 0.2%/min
                        happinessDecayRate = 0.075; // 0.15%/min
                    } else {
                        hungerDecayRate = 0.0007; // 0.0014%/min
                        happinessDecayRate = 0.0007;
                    }
                } else {
                    // Mobile: 1.75x faster decay
                    if (minutesActive <= 30) {
                        hungerDecayRate = 0.25 * 1.75; // 0.875%/min
                        happinessDecayRate = 0.225 * 1.75; // 0.7875%/min
                    } else {
                        hungerDecayRate = 0.005 * 1.75; // 0.0175%/min
                        happinessDecayRate = 0.005 * 1.75;
                    }
                }
                // If tab is not visible, halve the decay rate
                if (!this.isTabVisible) {
                    hungerDecayRate *= 0.5;
                    happinessDecayRate *= 0.5;
                }
                this.hunger = Math.max(0, this.hunger - hungerDecayRate);
                this.happiness = Math.max(0, this.happiness - happinessDecayRate);
                this.updateStatusBasedOnLevels();
                this.saveHealthData();
                this.updateHealthDisplay();
                this.updateSpeechBubble();
            }
        }, 30000); // Every 30 seconds
    },
    
    // Getter methods for accessing health values
    getHunger() {
        return this.hunger;
    },
    
    getHappiness() {
        return this.happiness;
    },
    
    getStatus() {
        return this.status;
    }
};

// Initialize health system when page loads
document.addEventListener('DOMContentLoaded', function() {
    petHealth.init();
    
    // Update health every minute for time-based checks
    setInterval(() => {
        petHealth.checkHealthStatus();
        petHealth.updateHealthDisplay();
        petHealth.updateSpeechBubble();
    }, 60000);
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.petHealth = petHealth;
}
