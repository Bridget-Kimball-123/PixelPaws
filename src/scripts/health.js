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
            
            if (minutesAway <= 30) {
                // First 30 minutes: Faster decay (0.5% hunger/min, 0.45% happiness/min)
                // 25% loss in first 30 minutes (health at 75%)
                hungerDecay = minutesAway * 0.5;
                happinessDecay = minutesAway * 0.45;
            } else {
                // After 30 minutes: Slower decay rate
                // First 30 minutes decay
                hungerDecay = 30 * 0.5; // First 30 minutes (25% loss)
                happinessDecay = 30 * 0.45; // First 30 minutes (25% loss)

                // Additional time after 30 minutes: 0.01% per minute
                const minutesAfterFirstHalfHour = minutesAway - 30;
                hungerDecay += minutesAfterFirstHalfHour * 0.01;
                happinessDecay += minutesAfterFirstHalfHour * 0.01;
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
        let total = this.hunger + this.happiness;
        let divisor = 2;
        
        // If hunger is below 30% and happiness is above 30%, add extra weight (half of hunger value)
        if (this.hunger < 30 && this.happiness > 30) {
            total += (this.hunger * 0.75);
            divisor = 2; // Still divide by 2 to get average
        }
        
        // If happiness is below 30% and hunger is above 30%, add extra weight (half of happiness value)
        if (this.happiness < 30 && this.hunger > 30) {
            total += (this.happiness * 0.75);
            divisor = 2; // Still divide by 2 to get average
        }
        
        return Math.round(total / divisor);
    },
    
    // Get health color based on percentage
    getHealthColor() {
        const health = this.getHealthPercentage();
        if (health >= 60) return '#4CAF50'; // Green - changed from 70
        if (health >= 30) return '#FF9800'; // Orange - changed from 40
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
            if (weather === 'rainy') {
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
            // Only decay if pet is not already at minimum levels
            if (this.hunger > 0 || this.happiness > 0) {
                
                // Calculate how long the page has been active
                const activeTime = Date.now() - this.activeStartTime;
                const minutesActive = activeTime / (60 * 1000);
                
                let hungerDecayRate;
                let happinessDecayRate;
                
                // Tiered decay system based on active time
                if (minutesActive <= 30) {
                    // First 30 minutes: Faster decay (0.5% hunger/min, 0.45% happiness/min)
                    hungerDecayRate = 0.25; // -0.25% every 30 seconds = -0.5% per minute
                    happinessDecayRate = 0.225; // -0.225% every 30 seconds = -0.45% per minute
                } else {
                    // After 30 minutes: Slower decay (0.01% per minute)
                    hungerDecayRate = 0.005; // -0.005% every 30 seconds = -0.01% per minute
                    happinessDecayRate = 0.005; // -0.005% every 30 seconds = -0.01% per minute
                }
                
                // If tab is not visible (hidden in background), halve the decay rate
                if (!this.isTabVisible) {
                    hungerDecayRate *= 0.5;
                    happinessDecayRate *= 0.5;
                }
                
                // Apply decay
                this.hunger = Math.max(0, this.hunger - hungerDecayRate);
                this.happiness = Math.max(0, this.happiness - happinessDecayRate);
                
                // Update status based on current levels
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
