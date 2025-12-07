// ===================================
// PixelPaws - Themes Page JavaScript
// Author: Bridget Kimball
// ===================================

// Initialize themes page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    renderThemesGrid();
    setupEventListeners();
    updateThemesUnlockedCount();
});

// Render loyalty calendar
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    for (let i = 1; i <= 7; i++) {
        const dayKey = `day${i}`;
        const isVisited = window.petTheme.visitDays[dayKey];
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${isVisited ? 'visited' : 'unvisited'}`;
        dayElement.innerHTML = `
            <div class="day-number">Day ${i}</div>
            <div class="day-status">${isVisited ? '✓' : '○'}</div>
        `;
        calendarGrid.appendChild(dayElement);
    }
}

// Render themes grid
function renderThemesGrid() {
    const themesGrid = document.getElementById('themesGrid');
    themesGrid.innerHTML = '';

    for (const [themeKey, themeData] of Object.entries(window.petTheme.themes)) {
        const isUnlocked = window.petTheme.isThemeUnlocked(themeKey);
        const isActive = window.petTheme.activeTheme === themeKey;
        
        const themeCard = document.createElement('div');
        themeCard.className = `theme-card ${!isUnlocked ? 'locked' : ''} ${isActive ? 'active' : ''}`;
        
        let cardContent = `
            <div class="theme-color-preview" style="background-color: ${themeData.primary};"></div>
            <h3>${themeData.name}</h3>
            <p class="theme-day">Unlocked on Day ${themeData.unlockedDay}</p>
        `;

        if (!isUnlocked) {
            cardContent += '<div class="lock-badge">🔒</div>';
            cardContent += '<p class="locked-message">Visit on Day ' + themeData.unlockedDay + ' to unlock</p>';
        } else if (isActive) {
            cardContent += '<div class="active-badge">✓ Active</div>';
        } else {
            cardContent += `<button class="btn-select-theme" data-theme="${themeKey}">Select Theme</button>`;
        }

        themeCard.innerHTML = cardContent;
        themesGrid.appendChild(themeCard);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Check-in button
    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function() {
            const result = window.petTheme.checkDailyVisit();
            
            if (result) {
                // New theme was unlocked
                // Play unlock sound effect
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('unlock');
                }
                showNotification(`Welcome back! You unlocked ${result.name}!`);
                window.petTheme.showThemeUnlockNotification(result);
            } else {
                // No new theme today
                // Play check-in sound effect
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('checkin');
                }
                showNotification('You already checked in today! Come back tomorrow for a new theme.');
            }
            
            // Refresh the UI
            renderCalendar();
            renderThemesGrid();
            updateThemesUnlockedCount();
        });
    }

    // Select theme buttons
    document.querySelectorAll('.btn-select-theme').forEach(btn => {
        btn.addEventListener('click', function() {
            const themeKey = this.getAttribute('data-theme');
            if (window.petTheme.isThemeUnlocked(themeKey)) {
                // Play theme selection sound effect
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('theme');
                }
                window.petTheme.applyTheme(themeKey);
                renderThemesGrid();
                showNotification(`Theme changed to ${window.petTheme.themes[themeKey].name}!`);
            }
        });
    });

    // Reset theme button
    const resetThemeBtn = document.getElementById('resetThemeBtn');
    if (resetThemeBtn) {
        resetThemeBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset your theme to the default purple? This will also reset your loyalty progress.')) {
                // Play reset sound effect
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('reset');
                }
                window.petTheme.resetTheme();
                renderCalendar();
                renderThemesGrid();
                updateThemesUnlockedCount();
                showNotification('Theme reset to default purple!');
            }
        });
    }
}

// Update themes unlocked count
function updateThemesUnlockedCount() {
    const count = window.petTheme.getVisitDayCount();
    const countElement = document.getElementById('themesUnlockedCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.opacity = '1';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }
}
