// ===================================
// PixelPaws - Theme & Loyalty System
// Author: Bridget Kimball
// ===================================

// Test localStorage availability
console.log('Testing localStorage availability...');
try {
    localStorage.setItem('_test', 'test');
    const testVal = localStorage.getItem('_test');
    localStorage.removeItem('_test');
    console.log('localStorage is available and working');
} catch (error) {
    console.error('localStorage is NOT available:', error);
}

// Theme and loyalty system object
const petTheme = {
    // Available themes with their color palettes
    themes: {
        purple: {
            name: 'Royal Purple',
            primary: '#660066',
            light: '#DFCDE7',
            border: '#9673A6',
            background: '#FBF4FF',
            text: '#660066',
            navActive: '#4B0082',
            unlockedDay: 1
        },
        blue: {
            name: 'Ocean Blue',
            primary: '#0066CC',
            light: '#CCE5FF',
            border: '#6699CC',
            background: '#F0F5FF',
            text: '#0066CC',
            navActive: '#003D99',
            unlockedDay: 2
        },
        green: {
            name: 'Forest Green',
            primary: '#008000',
            light: '#CCFFCC',
            border: '#66CC66',
            background: '#F0FFF0',
            text: '#008000',
            navActive: '#005C00',
            unlockedDay: 3
        },
        yellow: {
            name: 'Sunny Yellow',
            primary: '#CC9900',
            light: '#FFFFE0',
            border: '#FFD700',
            background: '#FFFFF0',
            text: '#CC9900',
            navActive: '#996600',
            unlockedDay: 4
        },
        orange: {
            name: 'Sunset Orange',
            primary: '#FF6600',
            light: '#FFE0B2',
            border: '#FF9944',
            background: '#FFF5E6',
            text: '#FF6600',
            navActive: '#CC4400',
            unlockedDay: 5
        },
        red: {
            name: 'Strawberry Red',
            primary: '#CC0000',
            light: '#FFE0E0',
            border: '#FF6666',
            background: '#FFF0F0',
            text: '#CC0000',
            navActive: '#990000',
            unlockedDay: 6
        },
        pink: {
            name: 'Bubblegum Pink',
            primary: '#FF1493',
            light: '#FFB6E1',
            border: '#FF69B4',
            background: '#FFF0F7',
            text: '#FF1493',
            navActive: '#CC0099',
            unlockedDay: 7
        }
    },

    // Current active theme
    activeTheme: 'purple',

    // Dark mode settings - SIMPLIFIED
    darkMode: {
        enabled: false,
        mode: 'auto' // 'auto', 'on', 'off'
    },

    // LOAD dark mode from localStorage IMMEDIATELY on page load
    // This runs BEFORE any other code can interfere
    loadDarkModeImmediately() {
        const STORAGE_KEY = 'petDarkModeSettings';
        console.log('[IMMEDIATE_LOAD] Running loadDarkModeImmediately()');
        
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            console.log('[IMMEDIATE_LOAD] localStorage value:', saved);
            
            if (saved) {
                const data = JSON.parse(saved);
                this.darkMode.mode = data.mode || 'auto';
                this.darkMode.enabled = data.enabled || false;
                console.log('[IMMEDIATE_LOAD] ✓ Loaded from storage:', JSON.stringify(this.darkMode));
            } else {
                console.log('[IMMEDIATE_LOAD] No saved data, using defaults');
                this.darkMode.mode = 'auto';
            }
        } catch (e) {
            console.error('[IMMEDIATE_LOAD] Error:', e);
            this.darkMode.mode = 'auto';
        }
    },

    // Track visit days for loyalty rewards
    visitDays: {
        day1: false,
        day2: false,
        day3: false,
        day4: false,
        day5: false,
        day6: false,
        day7: false
    },

    // Initialize theme system
    init() {
        console.log('\n=== [INIT] init() called ===');
        
        // CRITICAL: Load dark mode FIRST, before anything else
        this.loadDarkModeImmediately();
        console.log('[INIT] After loadDarkModeImmediately, mode is:', this.darkMode.mode);
        
        // Now update enabled status based on the loaded mode
        this.updateDarkModeEnabled();
        console.log('[INIT] After updateDarkModeEnabled, enabled is:', this.darkMode.enabled);
        
        // Apply the dark mode CSS
        this.applyDarkMode();
        console.log('[INIT] Applied dark mode styles');
        
        // Load other theme data
        this.loadThemeData();
        const newThemeUnlocked = this.checkDailyVisit();
        this.applyTheme(this.activeTheme);
        
        console.log('[INIT] Complete. darkMode:', JSON.stringify(this.darkMode));
        console.log('=== [INIT] init() finished ===\n');
        
        // Show notification if a new theme was unlocked
        if (newThemeUnlocked) {
            this.showThemeUnlockNotification(newThemeUnlocked);
        }
    },

    // Load dark mode settings from localStorage (DEPRECATED - use loadDarkModeImmediately)
    // Kept for compatibility
    loadDarkModeSettings() {
        // This is now handled by loadDarkModeImmediately()
        console.log('[LOAD_SETTINGS] This method is deprecated, loadDarkModeImmediately() is used instead');
    },

    // Save dark mode settings to localStorage
    saveDarkModeSettings() {
        const dataToSave = {
            mode: this.darkMode.mode,
            enabled: this.darkMode.enabled
        };
        const jsonString = JSON.stringify(dataToSave);
        console.log('[SAVE] Attempting to save:', jsonString);
        console.log('[SAVE] localStorage object available?', typeof localStorage !== 'undefined');
        
        try {
            localStorage.setItem('petDarkModeSettings', jsonString);
            console.log('[SAVE] ✓ Successfully called localStorage.setItem()');
        } catch (error) {
            console.error('[SAVE] ✗ ERROR calling localStorage.setItem():', error);
            return;
        }
        
        // Verify it was actually saved
        const retrieved = localStorage.getItem('petDarkModeSettings');
        console.log('[SAVE] Verification - localStorage.getItem() returned:', retrieved);
        
        if (retrieved === jsonString) {
            console.log('[SAVE] ✓ SUCCESS: Data matches exactly!');
        } else {
            console.error('[SAVE] ✗ ERROR: Data mismatch!');
            console.error('[SAVE]   Expected:', jsonString);
            console.error('[SAVE]   Got:     ', retrieved);
        }
        
        // Double check by getting all keys
        console.log('[SAVE] All localStorage keys:', Object.keys(localStorage));
        console.log('[SAVE] petDarkModeSettings value in storage:', localStorage.getItem('petDarkModeSettings'));
    },

    // Update dark mode enabled status based on mode
    updateDarkModeEnabled() {
        console.log('[UPDATE_ENABLED] Current mode:', this.darkMode.mode);
        if (this.darkMode.mode === 'on') {
            this.darkMode.enabled = true;
            console.log('[UPDATE_ENABLED] Mode is "on", set enabled = true');
        } else if (this.darkMode.mode === 'off') {
            this.darkMode.enabled = false;
            console.log('[UPDATE_ENABLED] Mode is "off", set enabled = false');
        } else if (this.darkMode.mode === 'auto') {
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.darkMode.enabled = systemPreference;
            console.log('[UPDATE_ENABLED] Mode is "auto", system preference:', systemPreference);
        } else {
            console.warn('[UPDATE_ENABLED] Unknown mode:', this.darkMode.mode);
            this.darkMode.enabled = false;
        }
    },

    // Set dark mode mode ('auto', 'on', 'off')
    setDarkModeMode(mode) {
        console.log('[SET_MODE] Requested mode:', mode);
        if (!['auto', 'on', 'off'].includes(mode)) {
            console.warn('[SET_MODE] Invalid mode, ignoring');
            return;
        }
        
        this.darkMode.mode = mode;
        console.log('[SET_MODE] Set mode to:', this.darkMode.mode);
        
        this.updateDarkModeEnabled();
        this.saveDarkModeSettings();
        this.applyDarkMode();
        console.log('[SET_MODE] Complete - mode:', this.darkMode.mode, 'enabled:', this.darkMode.enabled);
    },

    // Apply dark mode styles to the document
    applyDarkMode() {
        console.log('[APPLY] darkMode.enabled:', this.darkMode.enabled);
        if (this.darkMode.enabled) {
            document.documentElement.setAttribute('data-dark-mode', 'true');
            console.log('[APPLY] Set data-dark-mode="true" on HTML element');
        } else {
            document.documentElement.removeAttribute('data-dark-mode');
            console.log('[APPLY] Removed data-dark-mode attribute from HTML element');
        }
    },

    // Load theme and loyalty data from localStorage
    loadThemeData() {
        const savedData = localStorage.getItem('petThemeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.activeTheme = data.activeTheme || 'purple';
            this.visitDays = data.visitDays || this.visitDays;
            data.lastVisitDate && (this.lastVisitDate = data.lastVisitDate);
        } else {
            // First visit - mark day 1 as visited
            this.visitDays.day1 = true;
            this.lastVisitDate = this.getTodayAtMidnight();
            this.saveThemeData();
        }
    },

    // Get today's date at midnight (00:00:00)
    getTodayAtMidnight() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.getTime();
    },

    // Get a specific date at midnight
    getDateAtMidnight(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    },

    // Check if it's a new day (crossed midnight) and update visit counter
    checkDailyVisit() {
        const todayMidnight = this.getTodayAtMidnight();
        const lastVisitMidnight = this.getDateAtMidnight(this.lastVisitDate);
        
        let newThemeUnlocked = null;
        
        // If we've crossed into a new day
        if (todayMidnight > lastVisitMidnight) {
            // User is visiting on a new day, so add one visit day
            const dayCount = this.getVisitDayCount();
            
            if (dayCount < 7) {
                // Mark the next day as visited (only add 1, not multiple days)
                const nextDay = dayCount + 1;
                this.visitDays[`day${nextDay}`] = true;
                
                // Get the unlocked theme for this day
                for (const [themeKey, themeData] of Object.entries(this.themes)) {
                    if (themeData.unlockedDay === nextDay) {
                        newThemeUnlocked = { key: themeKey, name: themeData.name };
                        break;
                    }
                }
            }
            
            // Update last visit to today at midnight
            this.lastVisitDate = todayMidnight;
            this.saveThemeData();
        }
        
        return newThemeUnlocked;
    },

    // Get total number of visit days
    getVisitDayCount() {
        let count = 0;
        for (let i = 1; i <= 7; i++) {
            if (this.visitDays[`day${i}`]) {
                count++;
            }
        }
        return count;
    },

    // Get unlocked themes based on visit days
    getUnlockedThemes() {
        const unlockedThemes = [];
        const visitCount = this.getVisitDayCount();
        
        for (const [themeKey, themeData] of Object.entries(this.themes)) {
            if (themeData.unlockedDay <= visitCount) {
                unlockedThemes.push(themeKey);
            }
        }
        
        return unlockedThemes;
    },

    // Check if a theme is unlocked
    isThemeUnlocked(themeKey) {
        const theme = this.themes[themeKey];
        const visitCount = this.getVisitDayCount();
        return theme && theme.unlockedDay <= visitCount;
    },

    // Apply theme to page
    applyTheme(themeKey) {
        if (!this.themes[themeKey]) {
            console.error(`Theme ${themeKey} not found`);
            return;
        }

        const theme = this.themes[themeKey];
        const root = document.documentElement;

        // Apply CSS variables
        root.style.setProperty('--primary-purple', theme.primary);
        root.style.setProperty('--light-purple', theme.light);
        root.style.setProperty('--border-purple', theme.border);
        root.style.setProperty('--background-white', theme.background);
        root.style.setProperty('--text-dark', theme.text);
        root.style.setProperty('--nav-active', theme.navActive);

        // Set data attribute for dark mode theme detection
        root.setAttribute('data-active-theme', themeKey);

        this.activeTheme = themeKey;
        this.saveThemeData();
    },

    // Reset theme to default
    resetTheme() {
        this.activeTheme = 'purple';
        this.visitDays = {
            day1: true,
            day2: false,
            day3: false,
            day4: false,
            day5: false,
            day6: false,
            day7: false
        };
        this.lastVisitDate = this.getTodayAtMidnight();
        this.saveThemeData();
        this.applyTheme('purple');
    },

    // Show theme unlock notification
    showThemeUnlockNotification(themeInfo) {
        // Create notification container if it doesn't exist
        let notification = document.getElementById('theme-unlock-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'theme-unlock-notification';
            notification.className = 'theme-unlock-modal';
            document.body.appendChild(notification);
        }

        // Set the notification content
        const themeColor = this.themes[themeInfo.key].primary;
        notification.innerHTML = `
            <div class="theme-unlock-content" style="border-color: ${themeColor};">
                <div class="theme-unlock-header" style="background-color: ${themeColor};">
                    <h2>🎉 New Theme Unlocked! 🎉</h2>
                </div>
                <div class="theme-unlock-body">
                    <div class="theme-unlock-preview" style="background-color: ${themeColor};"></div>
                    <h3>${themeInfo.name}</h3>
                    <p>You've earned a new theme for visiting today!</p>
                    <p>Visit the <strong>Themes</strong> page to select it.</p>
                </div>
                <button class="theme-unlock-close" onclick="this.parentElement.parentElement.style.display = 'none';">Got it!</button>
            </div>
        `;

        // Show the notification
        notification.style.display = 'flex';

        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (notification && notification.style.display !== 'none') {
                notification.style.display = 'none';
            }
        }, 8000);
    }
};

// Initialize theme system when page loads
document.addEventListener('DOMContentLoaded', function() {
    petTheme.init();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.petTheme = petTheme;
    
    // Add a test function for debugging
    window.testDarkModePersistence = function() {
        console.log('\n=== Dark Mode Persistence Test ===');
        console.log('Current window.petTheme.darkMode:', JSON.stringify(window.petTheme.darkMode));
        const storageValue = localStorage.getItem('petDarkModeSettings');
        console.log('localStorage.getItem("petDarkModeSettings"):', storageValue);
        console.log('document.documentElement.getAttribute("data-dark-mode"):', document.documentElement.getAttribute('data-dark-mode'));
        console.log('\nTo manually test:');
        console.log('1. Run: window.petTheme.setDarkModeMode("on")');
        console.log('2. Run: window.testDarkModePersistence()');
        console.log('3. Refresh the page');
        console.log('4. Run: window.testDarkModePersistence() again\n');
    };
}
