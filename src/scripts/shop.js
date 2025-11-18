/**
 * Shop functionality for PixelPaws
 * Author: Bridget Kimball
 */

// Shop items catalog
const SHOP_ITEMS = {
    'red-collar': {
        name: 'Red Collar',
        cost: 15,
        type: 'collar'
    },
    'blue-bandana': {
        name: 'Blue Bandana',
        cost: 15,
        type: 'bandana'
    },
    'crown': {
        name: 'Royal Crown',
        cost: 35,
        type: 'crown'
    }
};

// Initialize shop when page loads
$(document).ready(function() {
    // Force health system to reload from localStorage immediately
    if (window.petHealth && typeof window.petHealth.loadHealthData === 'function') {
        console.log('Forcing health reload before shop initialization');
        window.petHealth.loadHealthData();
        console.log('Health after reload - Hunger:', window.petHealth.getHunger(), 'Happiness:', window.petHealth.getHappiness());
    }
    
    initShop();
    
    // Listen for localStorage changes (works across tabs/windows)
    window.addEventListener('storage', function(e) {
        if (e.key === 'petOwnedItems') {
            console.log('Storage changed for petOwnedItems, refreshing shop...');
            refreshShopDisplay();
        }
    });
    
    // Listen for page visibility changes (when user returns to tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('Page became visible, refreshing shop...');
            refreshShopDisplay();
        }
    });
    
    // Listen for page focus (when user returns to window)
    window.addEventListener('focus', function() {
        console.log('Window focused, refreshing shop...');
        refreshShopDisplay();
    });
});

function initShop() {
    // Wait for health system to be fully initialized
    if (window.petHealth) {
        // Force reload health data from localStorage to get current values
        if (typeof window.petHealth.loadHealthData === 'function') {
            window.petHealth.loadHealthData();
        }
        
        // Update displays after loading data
        updateHappinessDisplay();
        checkShopAvailability();
    } else {
        // If health system not ready, wait and try again
        setTimeout(initShop, 100);
        return;
    }
    
    // Load owned items
    loadOwnedItems();
    
    // Use custom.js updatePetDisplay to render pet with customizations
    if (window.updatePetDisplay) {
        window.updatePetDisplay();
    }
    
    // Add owned accessories to the pet
    renderShopAccessories();
    
    // Setup buy button handlers
    setupBuyButtons();
}

// Check if shop should be accessible
function checkShopAvailability() {
    if (window.petHealth) {
        const happiness = window.petHealth.getHappiness();
        
        if (happiness < 50) {
            // Close shop
            $('.shop-closed').show();
            $('.currency-display').hide();
            $('.pet-preview').hide();
            $('.shop-items').hide();
        } else {
            // Open shop
            $('.shop-closed').hide();
            $('.currency-display').show();
            $('.pet-preview').show();
            $('.shop-items').show();
        }
    }
}

// Refresh shop display when localStorage changes
function refreshShopDisplay() {
    // Reload health data from localStorage
    if (window.petHealth && typeof window.petHealth.loadHealthData === 'function') {
        window.petHealth.loadHealthData();
    }
    
    // Clear all owned badges and classes
    $('.shop-item').removeClass('owned');
    $('.owned-badge').hide();
    
    // Reload owned items and update UI
    loadOwnedItems();
    
    // Update happiness display
    updateHappinessDisplay();
    
    // Re-render accessories on pet
    renderShopAccessories();
}

// Load owned items from localStorage
function loadOwnedItems() {
    const owned = getOwnedItems();
    const equipped = window.getEquippedAccessories ? window.getEquippedAccessories() : [];
    console.log('Loading owned items:', owned);
    console.log('Loading equipped items:', equipped);
    
    owned.forEach(itemId => {
        const $item = $(`.shop-item[data-item="${itemId}"]`);
        $item.addClass('owned');
        $item.find('.owned-badge').show();
        $item.find('.buy-btn').hide();
        $item.find('.equip-btn').show();
        
        // Update equip button text based on equipped state
        const isEquipped = equipped.includes(itemId);
        $item.find('.equip-btn').text(isEquipped ? 'Unequip' : 'Equip');
        $item.find('.equip-btn').toggleClass('equipped', isEquipped);
    });
}

// Get owned items from localStorage
function getOwnedItems() {
    const owned = localStorage.getItem('petOwnedItems');
    console.log('Raw owned items from localStorage:', owned);
    return owned ? JSON.parse(owned) : [];
}

// Save owned items to localStorage
function saveOwnedItems(items) {
    localStorage.setItem('petOwnedItems', JSON.stringify(items));
}

// Add item to owned list
function addOwnedItem(itemId) {
    const owned = getOwnedItems();
    if (!owned.includes(itemId)) {
        owned.push(itemId);
        saveOwnedItems(owned);
    }
}

// Render accessories on the pet (pet customization handled by custom.js)
function renderShopAccessories() {
    // Use the shared renderAccessories function from custom.js
    if (window.renderAccessories) {
        window.renderAccessories();
    }
}

// Get owned items from localStorage (use shared function from custom.js)
function getOwnedItems() {
    if (window.getOwnedAccessories) {
        return window.getOwnedAccessories();
    }
    const owned = localStorage.getItem('petOwnedItems');
    console.log('Raw owned items from localStorage:', owned);
    return owned ? JSON.parse(owned) : [];
}

// Setup buy button handlers
function setupBuyButtons() {
    $('.buy-btn').on('click', function() {
        const $button = $(this);
        const itemId = $button.data('item');
        const $item = $button.closest('.shop-item');
        const cost = parseInt($item.data('cost'));
        
        purchaseItem(itemId, cost);
    });
    
    // Setup equip button handlers
    $('.equip-btn').on('click', function() {
        const $button = $(this);
        const itemId = $button.data('item');
        
        toggleEquip(itemId);
    });
}

// Purchase an item
function purchaseItem(itemId, cost) {
    if (!window.petHealth) {
        showNotification('Unable to access pet health data.');
        return;
    }
    
    const currentHappiness = window.petHealth.getHappiness();
    
    // Check if already owned
    const owned = getOwnedItems();
    if (owned.includes(itemId)) {
        showNotification('You already own this item!');
        return;
    }
    
    // Check if enough happiness
    if (currentHappiness < cost) {
        showNotification(`Not enough happiness! You need ${cost}% but only have ${Math.round(currentHappiness)}%.`);
        return;
    }
    
    // Show confirmation modal
    const itemName = SHOP_ITEMS[itemId].name;
    showConfirmModal(`Purchase ${itemName} for ${cost}% happiness?`, () => {
        // Deduct happiness
        window.petHealth.happiness = Math.max(0, currentHappiness - cost);
        window.petHealth.saveHealthData();
        window.petHealth.updateHealthDisplay();
        
        // Add to owned items
        addOwnedItem(itemId);
        
        // Auto-equip newly purchased item
        if (window.toggleEquipAccessory) {
            const equipped = window.getEquippedAccessories();
            if (!equipped.includes(itemId)) {
                window.toggleEquipAccessory(itemId);
            }
        }
        
        // Update UI
        updateHappinessDisplay();
        
        const $item = $(`.shop-item[data-item="${itemId}"]`);
        $item.addClass('owned');
        $item.find('.owned-badge').show();
        $item.find('.buy-btn').hide();
        $item.find('.equip-btn').show().text('Unequip').addClass('equipped');
        
        // Refresh pet preview with new accessory
        renderShopAccessories();
        
        // Check if shop should close
        checkShopAvailability();
        
        // Get remaining happiness and show success message
        const remainingHappiness = window.petHealth.getHappiness().toFixed(1);
        showNotification(`${itemName} purchased! 🎉<br>Remaining happiness: ${remainingHappiness}%`);
    });
}

// Toggle equip/unequip for an accessory
function toggleEquip(itemId) {
    if (!window.toggleEquipAccessory) {
        console.error('toggleEquipAccessory not available');
        return;
    }
    
    const isNowEquipped = window.toggleEquipAccessory(itemId);
    const itemName = SHOP_ITEMS[itemId].name;
    
    // Update button
    const $item = $(`.shop-item[data-item="${itemId}"]`);
    $item.find('.equip-btn').text(isNowEquipped ? 'Unequip' : 'Equip');
    $item.find('.equip-btn').toggleClass('equipped', isNowEquipped);
    
    // Refresh pet preview
    renderShopAccessories();
    
    // Show notification
    showNotification(isNowEquipped ? `${itemName} equipped! ✨` : `${itemName} unequipped.`);
}

// Show notification (using custom purple popup style)
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
        <strong>PixelPaws</strong>
        <p>${message}</p>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Show confirmation modal
function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');
    
    messageEl.textContent = message;
    modal.style.display = 'flex';
    
    // Handle Yes button
    const handleYes = () => {
        modal.style.display = 'none';
        onConfirm();
        cleanup();
    };
    
    // Handle No button
    const handleNo = () => {
        modal.style.display = 'none';
        cleanup();
    };
    
    // Cleanup listeners
    const cleanup = () => {
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        modal.removeEventListener('click', handleOverlay);
    };
    
    // Handle clicking outside modal
    const handleOverlay = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            cleanup();
        }
    };
    
    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
    modal.addEventListener('click', handleOverlay);
}
