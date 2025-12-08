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

    // Track the theme unlocked during this session's init
    lastUnlockedTheme: null,

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
        
        // Store the unlocked theme so the check-in button can access it
        this.lastUnlockedTheme = newThemeUnlocked;
        
        this.applyTheme(this.activeTheme);
        
        console.log('[INIT] Complete. darkMode:', JSON.stringify(this.darkMode));
        console.log('[INIT] lastUnlockedTheme:', this.lastUnlockedTheme);
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

    // Save theme data to localStorage
    saveThemeData() {
        const data = {
            activeTheme: this.activeTheme,
            visitDays: this.visitDays,
            lastVisitDate: this.lastVisitDate
        };
        localStorage.setItem('petThemeData', JSON.stringify(data));
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

        // Apply light mode CSS variables
        root.style.setProperty('--primary-purple', theme.primary);
        root.style.setProperty('--light-purple', theme.light);
        root.style.setProperty('--border-purple', theme.border);
        root.style.setProperty('--background-white', theme.background);
        root.style.setProperty('--text-dark', theme.text);
        root.style.setProperty('--nav-active', theme.navActive);

        // Calculate and apply dark mode versions of the colors for better contrast
        // Dark mode backgrounds: very dark (almost black but with color tint)
        const darkModeBackground = this.adjustBrightness(theme.background, 0.15);
        // Dark mode light sections: darker but visible
        const darkModeLight = this.adjustBrightness(theme.light, 0.30);
        // Dark mode primary: keep vibrant for visibility
        const darkModePrimary = this.adjustBrightness(theme.primary, 0.70);
        // Dark mode border: medium darkness
        const darkModeBorder = this.adjustBrightness(theme.border, 0.50);
        // Dark mode text: light and readable
        const darkModeText = this.adjustBrightness(theme.text, 1.8);
        // Dark mode nav active: visible against dark background
        const darkModeNavActive = this.adjustBrightness(theme.navActive, 0.80);

        // Store dark mode colors in CSS custom properties that dark mode CSS can use
        root.style.setProperty('--dark-primary', darkModePrimary);
        root.style.setProperty('--dark-light', darkModeLight);
        root.style.setProperty('--dark-border', darkModeBorder);
        root.style.setProperty('--dark-background', darkModeBackground);
        root.style.setProperty('--dark-text', darkModeText);
        root.style.setProperty('--dark-nav-active', darkModeNavActive);

        // Set data attribute for dark mode theme detection
        root.setAttribute('data-active-theme', themeKey);

        this.activeTheme = themeKey;
        this.saveThemeData();
    },

    // Helper function to adjust color brightness
    // brightness > 1 lightens, brightness < 1 darkens
    adjustBrightness(color, brightness) {
        const num = parseInt(color.replace('#', ''), 16);
        let r = Math.round((num >> 16) * brightness);
        let g = Math.round(((num >> 8) & 0x00FF) * brightness);
        let b = Math.round((num & 0x0000FF) * brightness);
        
        // Clamp values between 0 and 255
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // DEPRECATED - old color helper functions kept for reference
    darkenColor(color, factor) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - Math.round(255 * factor));
        const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * factor));
        const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * factor));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // DEPRECATED - old color helper functions kept for reference
    lightenColor(color, factor) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + Math.round(255 * factor));
        const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * factor));
        const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * factor));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
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

    // Test function for loyalty/theme rewards - advance to next day
    window.testAdvanceDay = function() {
        console.log('\n=== Testing Theme Loyalty System ===');
        let data = localStorage.getItem('petThemeData');
        
        if (!data) {
            console.log('No existing petThemeData found. Creating initial data...');
            data = {
                activeTheme: 'purple',
                visitDays: { day1: true, day2: false, day3: false, day4: false, day5: false, day6: false, day7: false },
                lastVisitDate: new Date(Date.now() - 86400000).getTime() // Yesterday
            };
        } else {
            data = JSON.parse(data);
            console.log('Current visitDays:', data.visitDays);
            console.log('Moving lastVisitDate back 1 more day...');
            // Keep moving back past days to test progression
            data.lastVisitDate = new Date(data.lastVisitDate - 86400000).getTime();
        }
        
        localStorage.setItem('petThemeData', JSON.stringify(data));
        console.log('✓ Updated localStorage. Triggering daily visit check...');
        
        // Reload theme data and check for new day
        petTheme.loadThemeData();
        const unlockedTheme = petTheme.checkDailyVisit();
        
        // Update the calendar display if this is the themes page
        if (typeof updateLoyaltyCalendar === 'function') {
            updateLoyaltyCalendar();
            console.log('✓ Calendar updated');
        }
        
        // Show notification if theme was unlocked
        if (unlockedTheme) {
            console.log(`🎉 Unlocked: ${unlockedTheme.key} theme`);
            if (typeof showNotification === 'function') {
                showNotification(`🎉 You unlocked the ${unlockedTheme.key.toUpperCase()} theme!`);
            }
        }
        
        console.log('✓ Day advanced! Current visitDays:', petTheme.visitDays);
        console.log('Ready for another advancement. Run window.testAdvanceDay() again!\n');
    };
}
