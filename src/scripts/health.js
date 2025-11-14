// ===================================
// PixelPaws - Health Tracking System
// Author: Bridget Kimball
// ===================================

// Health status constants
const HEALTH_STATUS = {
    HEALTHY: 'healthy',
    DEPLETED: 'depleted',
    SICK: 'sick'
};

// Time thresholds (in milliseconds)
const EIGHT_HOURS = 8 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// Health tracking object
const petHealth = {
    lastVisit: null,
    status: HEALTH_STATUS.HEALTHY,
    hunger: 100,
    happiness: 100,
    
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
        this.startIdleDecay();
        // Update last visit AFTER checking status to preserve decay between page loads
        this.updateLastVisit();
    },
    
    // Load health data from localStorage
    loadHealthData() {
        const savedData = localStorage.getItem('petHealthData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.lastVisit = data.lastVisit;
            this.status = data.status || HEALTH_STATUS.HEALTHY;
            this.hunger = data.hunger || 100;
            this.happiness = data.happiness || 100;
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
        
        if (timeAway >= TWENTY_FOUR_HOURS) {
            // Pet is sick - 24+ hours = 20% health
            if (this.status !== HEALTH_STATUS.SICK) {
                this.status = HEALTH_STATUS.SICK;
                this.hunger = Math.min(this.hunger, 20);
                this.happiness = Math.min(this.happiness, 20);
                this.resetRecoveryActions();
            }
        } else if (timeAway >= EIGHT_HOURS) {
            // Pet is depleted - 8+ hours = 50% health
            if (this.status !== HEALTH_STATUS.DEPLETED) {
                this.status = HEALTH_STATUS.DEPLETED;
                this.hunger = Math.min(this.hunger, 50);
                this.happiness = Math.min(this.happiness, 50);
                this.resetRecoveryActions();
            }
        } else if (timeAway > 0) {
            // Gradual decay based on time away (only if status hasn't changed to sick/depleted)
            // Only apply decay if more than 1 minute has passed to avoid drops during page navigation
            if (this.status === HEALTH_STATUS.HEALTHY && timeAway > 60000) { // 60000ms = 1 minute
                const minutesAway = timeAway / (60 * 1000);
                // Decay: 0.2% hunger per minute, 0.1% happiness per minute (matching idle decay)
                const hungerDecay = minutesAway * 0.2;
                const happinessDecay = minutesAway * 0.1;
                
                this.hunger = Math.max(0, this.hunger - hungerDecay);
                this.happiness = Math.max(0, this.happiness - happinessDecay);
            }
        }
        
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
                // Treat increases hunger by 1%
                this.hunger = Math.min(100, this.hunger + 1);
                break;
            case 'fetch':
                this.recovery.played = true;
                // Fetch increases happiness by 10%
                this.happiness = Math.min(100, this.happiness + 10);
                break;
            case 'pet':
                this.recovery.petted = true;
                // Pet increases happiness by 5%
                this.happiness = Math.min(100, this.happiness + 5);
                break;
            case 'brush':
                this.recovery.brushed = true;
                // Brush increases happiness by 1%
                this.happiness = Math.min(100, this.happiness + 1);
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
        const avgHealth = (this.hunger + this.happiness) / 2;
        
        // If health is good, upgrade status to HEALTHY
        if (avgHealth >= 70 && this.status !== HEALTH_STATUS.HEALTHY) {
            this.status = HEALTH_STATUS.HEALTHY;
            this.resetRecoveryActions();
            console.log('Status upgraded to HEALTHY');
        }
        // If health is moderate, downgrade to DEPLETED if currently healthy
        else if (avgHealth >= 40 && avgHealth < 70) {
            if (this.status === HEALTH_STATUS.HEALTHY) {
                this.status = HEALTH_STATUS.DEPLETED;
                this.resetRecoveryActions();
                console.log('Status downgraded to DEPLETED');
            }
        }
        // If health is low, set to SICK
        else if (avgHealth < 40 && this.status !== HEALTH_STATUS.SICK) {
            this.status = HEALTH_STATUS.SICK;
            this.resetRecoveryActions();
            console.log('Status downgraded to SICK');
        }
    },
    
    // Check if pet has recovered
    checkRecovery() {
        if (this.status === HEALTH_STATUS.DEPLETED) {
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
    
    // Get health percentage (average of hunger and happiness)
    getHealthPercentage() {
        return Math.round((this.hunger + this.happiness) / 2);
    },
    
    // Get health color based on percentage
    getHealthColor() {
        const health = this.getHealthPercentage();
        if (health >= 70) return '#4CAF50'; // Green
        if (health >= 40) return '#FF9800'; // Orange
        return '#F44336'; // Red
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
        
        // Show recovery requirements if needed
        const recoveryDiv = healthBar.querySelector('.recovery-needed');
        if (recoveryDiv) {
            const requiredActions = this.getRequiredActions();
            if (requiredActions.length > 0) {
                recoveryDiv.innerHTML = `<strong>Recovery needed:</strong> ${requiredActions.join(', ')}`;
                recoveryDiv.classList.add('show');
            } else {
                recoveryDiv.classList.remove('show');
            }
        }
        
        // Update mood based on health and weather
        this.updateMood();
    },
    
    // Update speech bubble based on health status
    updateSpeechBubble() {
        const speechBubble = document.querySelector('.speech-bubble p');
        if (!speechBubble) return;
        
        let message = '';
        
        if (this.status === HEALTH_STATUS.SICK) {
            const messages = [
                "I'm not feeling well... 🤒",
                "I need lots of care to feel better... 💔",
                "Please help me get healthy again! 🏥",
                "I'm so sick... I need food, play, pets, brushing, and a toy... 😢",
                "I feel terrible... please help me... 😭"
            ];
            message = messages[Math.floor(Math.random() * messages.length)];
        } else if (this.status === HEALTH_STATUS.DEPLETED) {
            const messages = [
                "I'm hungry and bored... 😔",
                "I need food and playtime! 🍖🎾",
                "Please feed me and play with me! 🥺",
                "I'm feeling neglected... Feed me and let's play! 💙",
                "I'm not feeling great... 😟"
            ];
            message = messages[Math.floor(Math.random() * messages.length)];
        } else {
            // Healthy - check weather for mood
            const weather = this.getWeather();
            if (weather === 'rainy') {
                const messages = [
                    "It's raining... I'm a bit sad 🌧️",
                    "The rain makes me feel down... 💙",
                    "I don't like the rain much... 😔",
                    "Play with me to cheer me up! 🌧️"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else if (weather === 'snowy') {
                const messages = [
                    "Snow! Let's play! ❄️",
                    "I love the snow! Play with me! ⛄",
                    "Snowy day fun! 🌨️",
                    "The snow makes me want to play! ❄️"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else if (weather === 'stormy') {
                const messages = [
                    "The storm scares me... 😰",
                    "I'm scared! Hold me! ⛈️",
                    "Thunder is so scary! 😨",
                    "Please comfort me during the storm... 💔"
                ];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else {
                // Sunny or default - happy messages
                const messages = [
                    "Hello! I'm feeling happy today! 😊",
                    "What a beautiful day! ☀️",
                    "I love sunny days! 🌞",
                    "Let's play together! 🎉"
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
        } else if (this.status === HEALTH_STATUS.DEPLETED) {
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
        if (this.status === HEALTH_STATUS.DEPLETED) {
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
            // Only decay if pet is not already at minimum levels
            if (this.hunger > 0 || this.happiness > 0) {
                
                // Decrease hunger and happiness very slowly
                this.hunger = Math.max(0, this.hunger - 0.05); // -0.05% every 30 seconds = -0.1% per minute
                this.happiness = Math.max(0, this.happiness - 0.05); // -0.05% every 30 seconds = -0.1% per minute
                
                // Update status based on current levels
                this.updateStatusBasedOnLevels();
                
                this.saveHealthData();
                this.updateHealthDisplay();
                this.updateSpeechBubble();
            }
        }, 30000); // Every 30 seconds
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
