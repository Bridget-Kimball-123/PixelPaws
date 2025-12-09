/**
 * Achievements system for PixelPaws
 * Author: Bridget Kimball
 */

const achievements = {
    // Achievement definitions
    definitions: {
        'first-purchase': {
            name: 'First Purchase',
            description: 'Buy your first accessory from the shop',
            icon: '🛍️',
            condition: () => achievements.checkFirstPurchase()
        },
        'first-play': {
            name: 'First Play',
            description: 'Interact with your pet (feed, treat, fetch, pet, toy, or brush)',
            icon: '🎮',
            condition: () => achievements.checkFirstPlay()
        },
        'first-customization': {
            name: 'First Customization',
            description: 'Customize your pet\'s appearance',
            icon: '🎨',
            condition: () => achievements.checkFirstCustomization()
        },
        'first-favorite': {
            name: 'Collector\'s Heart',
            description: 'Add your first accessory to favorites',
            icon: '❤️',
            condition: () => achievements.checkFirstFavorite()
        },
        'returning': {
            name: 'Returning Visitor',
            description: 'Visit on day 2 of the loyalty program',
            icon: '📅',
            condition: () => achievements.checkReturning()
        }
    },

    // Get unlocked achievements from localStorage
    getUnlocked: () => {
        const unlocked = localStorage.getItem('petAchievements');
        return unlocked ? JSON.parse(unlocked) : {};
    },

    // Save unlocked achievements to localStorage
    saveUnlocked: (unlocked) => {
        localStorage.setItem('petAchievements', JSON.stringify(unlocked));
    },

    // Check if an achievement is unlocked
    isUnlocked: (achievementId) => {
        return achievements.getUnlocked()[achievementId] !== undefined;
    },

    // Unlock an achievement
    unlock: (achievementId) => {
        const unlocked = achievements.getUnlocked();
        if (!unlocked[achievementId]) {
            unlocked[achievementId] = {
                unlockedAt: new Date().toISOString(),
                unlockedDate: new Date().toLocaleDateString()
            };
            achievements.saveUnlocked(unlocked);
            achievements.showUnlockNotification(achievementId);
            return true;
        }
        return false;
    },

    // Check if user has made first purchase
    checkFirstPurchase: () => {
        const owned = localStorage.getItem('petOwnedItems');
        return owned && JSON.parse(owned).length > 0;
    },

    // Check if user has played with pet
    checkFirstPlay: () => {
        // Check if user has ever intentionally played with pet
        return localStorage.getItem('petHasPlayedWithPet') === 'true';
    },

    // Check if user has customized pet
    checkFirstCustomization: () => {
        // Check if user has ever intentionally saved a customization
        return localStorage.getItem('petHasSavedCustomization') === 'true';
    },

    // Check if user has favorited an accessory
    checkFirstFavorite: () => {
        const favorites = localStorage.getItem('petFavorites');
        return favorites && JSON.parse(favorites).length > 0;
    },

    // Check if user has returned on day 2
    checkReturning: () => {
        // Check if user has been marked as a returning visitor
        return localStorage.getItem('petHasReturned') === 'true';
    },

    // Check all achievements and unlock any that are now eligible
    checkAll: () => {
        let newUnlocks = 0;
        for (const [id, def] of Object.entries(achievements.definitions)) {
            if (!achievements.isUnlocked(id) && def.condition()) {
                if (achievements.unlock(id)) {
                    newUnlocks++;
                }
            }
        }
        return newUnlocks;
    },

    // Show unlock notification (modal only, no bottom notification)
    showUnlockNotification: (achievementId) => {
        const def = achievements.definitions[achievementId];
        if (!def) return;

        // Show only the modal popup, no bottom notification
        achievements.showUnlockModal(achievementId, def);
    },

    // Show unlock modal popup
    showUnlockModal: (achievementId, def) => {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'achievement-unlock-modal-overlay';
        modal.innerHTML = `
            <div class="achievement-unlock-modal">
                <div class="modal-header">
                    <h2>🎉 Achievement Unlocked! 🎉</h2>
                </div>
                <div class="modal-body">
                    <div class="modal-icon">${def.icon}</div>
                    <h3>${def.name}</h3>
                    <p>${def.description}</p>
                    <p class="unlock-time">Unlocked on ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-close-btn">Continue</button>
                </div>
            </div>
        `;
        
        // Ensure modal has proper styling for bottom positioning
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '10001';
        modal.style.display = 'flex';
        modal.style.alignItems = 'flex-end';
        modal.style.justifyContent = 'center';
        modal.style.backgroundColor = 'transparent';
        modal.style.pointerEvents = 'none';
        
        document.body.appendChild(modal);
        console.log('Achievement modal created and appended to body');

        // Close modal when button clicked or overlay clicked
        const closeBtn = modal.querySelector('.modal-close-btn');
        
        const closeModal = () => {
            modal.classList.add('closing');
            setTimeout(() => {
                if (modal && modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        };
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                closeModal();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Overlay clicked');
                closeModal();
            }
        });

        // Show modal with animation - use longer delay to ensure DOM is ready
        setTimeout(() => {
            modal.classList.add('show');
            console.log('Achievement modal show class added');
        }, 50);
    },

    // Update UI to show achievement status
    updateUI: () => {
        const unlocked = achievements.getUnlocked();
        const totalUnlocked = Object.keys(unlocked).length;
        const totalAchievements = Object.keys(achievements.definitions).length;
        const progress = (totalUnlocked / totalAchievements) * 100;

        // Update progress display
        const badgesEarned = document.getElementById('badges-earned');
        if (badgesEarned) {
            badgesEarned.textContent = totalUnlocked;
        }

        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
            if (progress > 0) {
                progressFill.textContent = Math.round(progress) + '%';
            }
        }

        // Update individual badges
        document.querySelectorAll('.achievement-badge').forEach(badge => {
            const achievementId = badge.dataset.achievement;
            const isUnlocked = achievements.isUnlocked(achievementId);

            if (isUnlocked) {
                badge.classList.add('unlocked');
                badge.classList.remove('locked');
                const unlockedData = unlocked[achievementId];
                const statusText = badge.querySelector('.status-text');
                statusText.textContent = 'Unlocked';
                statusText.classList.remove('locked');
                statusText.classList.add('unlocked');

                // Add unlock date
                if (!badge.querySelector('.unlock-date')) {
                    const dateSpan = document.createElement('span');
                    dateSpan.className = 'unlock-date';
                    dateSpan.textContent = `Unlocked on ${unlockedData.unlockedDate}`;
                    badge.querySelector('.badge-status').appendChild(dateSpan);
                }
            }
        });
    },

    // Initialize achievements on page load
    init: () => {
        console.log('Initializing achievements...');
        
        // Check all achievements
        const newUnlocks = achievements.checkAll();
        if (newUnlocks > 0) {
            console.log(`${newUnlocks} new achievement(s) unlocked!`);
        }

        // Update UI
        achievements.updateUI();

        // Setup rendering if this is the achievements page
        if (window.updatePetDisplay) {
            window.updatePetDisplay();
        }

        if (window.renderAccessories) {
            window.renderAccessories();
        }
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    achievements.init();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.achievements = achievements;
}
