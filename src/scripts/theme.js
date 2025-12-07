// ===================================
// PixelPaws - Theme & Loyalty System
// Author: Bridget Kimball
// ===================================

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
            name: 'Rose Red',
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
        this.loadThemeData();
        const newThemeUnlocked = this.checkDailyVisit();
        this.applyTheme(this.activeTheme);
        
        // Show notification if a new theme was unlocked
        if (newThemeUnlocked) {
            this.showThemeUnlockNotification(newThemeUnlocked);
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
}
