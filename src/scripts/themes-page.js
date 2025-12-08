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
    console.log('\n=== [SETUP] setupEventListeners starting ===');
    console.log('[SETUP] window.petTheme.darkMode:', JSON.stringify(window.petTheme.darkMode));
    
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

    // Dark mode dropdown
    const darkModeSelect = document.getElementById('dark-mode-mode');
    const darkModeDescription = document.getElementById('dark-mode-description');
    const saveDarkModeBtn = document.getElementById('saveDarkModeBtn');
    
    if (darkModeSelect) {
        // Set current value on page load
        console.log('[DROPDOWN_INIT] ========================================');
        console.log('[DROPDOWN_INIT] Setting dropdown initial value');
        console.log('[DROPDOWN_INIT] window.petTheme.darkMode.mode:', window.petTheme.darkMode.mode);
        console.log('[DROPDOWN_INIT] window.petTheme.darkMode:', JSON.stringify(window.petTheme.darkMode));
        console.log('[DROPDOWN_INIT] darkModeSelect element exists?', !!darkModeSelect);
        
        if (darkModeSelect) {
            console.log('[DROPDOWN_INIT] Available options:');
            Array.from(darkModeSelect.options).forEach((opt, idx) => {
                console.log(`  [${idx}] value="${opt.value}" text="${opt.text}"`);
            });
            
            darkModeSelect.value = window.petTheme.darkMode.mode;
            console.log('[DROPDOWN_INIT] Set darkModeSelect.value to:', darkModeSelect.value);
            console.log('[DROPDOWN_INIT] Dropdown value now shows:', darkModeSelect.value);
            console.log('[DROPDOWN_INIT] Does it match petTheme.mode?', darkModeSelect.value === window.petTheme.darkMode.mode);
            
            // Add one more verification immediately after
            setTimeout(() => {
                console.log('[DROPDOWN_INIT_VERIFY] After setupEventListeners, dropdown.value is still:', darkModeSelect.value);
            }, 100);
        }
        updateDarkModeDescription();
        console.log('[DROPDOWN_INIT] ========================================\n');
        
        // Listen for changes - PREVIEW dark mode without saving
        darkModeSelect.addEventListener('change', function() {
            const selectedMode = this.value;
            console.log('Dropdown changed to:', selectedMode);
            console.log('Applying PREVIEW of dark mode (not saving yet)');
            
            // Create a temporary copy to preview
            const tempMode = selectedMode;
            let tempEnabled = false;
            
            if (tempMode === 'on') {
                tempEnabled = true;
            } else if (tempMode === 'off') {
                tempEnabled = false;
            } else if (tempMode === 'auto') {
                tempEnabled = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            
            console.log('Preview: mode=' + tempMode + ', enabled=' + tempEnabled);
            
            // Apply preview visually
            if (tempEnabled) {
                document.documentElement.setAttribute('data-dark-mode', 'true');
            } else {
                document.documentElement.removeAttribute('data-dark-mode');
            }
            
            // Update description
            updateDarkModeDescription();
        });
    }
    
    // Save button for dark mode - this is where we actually save
    if (saveDarkModeBtn) {
        saveDarkModeBtn.addEventListener('click', function() {
            console.log('\n[SAVE_BTN] === Save button clicked ===');
            const selectedMode = darkModeSelect.value;
            console.log('[SAVE_BTN] Selected mode from dropdown:', selectedMode);
            console.log('[SAVE_BTN] Calling window.petTheme.setDarkModeMode(' + selectedMode + ')');
            window.petTheme.setDarkModeMode(selectedMode);
            
            // Show confirmation
            const modeLabels = {
                'auto': 'Automatic (System Default)',
                'on': 'Always On',
                'off': 'Always Off'
            };
            showNotification(`✓ Dark mode settings saved: ${modeLabels[selectedMode]}`);
            console.log('[SAVE_BTN] === Save button processing complete ===\n');
        });
    }
    console.log('=== [SETUP] setupEventListeners complete ===\n');
    console.log('Final darkModeSelect.value:', darkModeSelect?.value);
}

// Update dark mode description text
function updateDarkModeDescription() {
    const description = document.getElementById('dark-mode-description');
    if (!description) return;
    
    const mode = window.petTheme.darkMode.mode;
    const descriptions = {
        'auto': 'Your device\'s dark mode setting will be used.',
        'on': 'Dark mode is always enabled.',
        'off': 'Dark mode is always disabled.'
    };
    
    description.textContent = descriptions[mode] || 'Unknown setting';
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
