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
    // Load current happiness from health system
    updateHappinessDisplay();
    
    // Check if shop should be open
    checkShopAvailability();
    
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

// Update happiness display
function updateHappinessDisplay() {
    if (window.petHealth) {
        const happiness = Math.round(window.petHealth.happiness);
        $('.happiness-amount').text(happiness);
    }
}

// Check if shop should be accessible
function checkShopAvailability() {
    if (window.petHealth) {
        const happiness = window.petHealth.happiness;
        
        if (happiness < 25) {
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
    console.log('Loading owned items:', owned);
    
    owned.forEach(itemId => {
        const $item = $(`.shop-item[data-item="${itemId}"]`);
        $item.addClass('owned');
        $item.find('.owned-badge').show();
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
    const pet = document.querySelector('.pet-preview .pet');
    if (!pet) return;
    
    // Load and display owned accessories
    const owned = getOwnedItems();
    const accessories = pet.querySelector('.pet-accessories');
    if (accessories) {
        accessories.innerHTML = '';
        
        owned.forEach(itemId => {
            const accessory = createAccessoryElement(itemId);
            if (accessory) {
                accessories.appendChild(accessory[0]); // jQuery element to DOM element
            }
        });
    }
}

// Create accessory element for display
function createAccessoryElement(itemId) {
    let $accessory;
    
    switch(itemId) {
        case 'red-collar':
            $accessory = $('<div class="accessory collar"></div>');
            $accessory.css({
                'position': 'absolute',
                'bottom': '45%',
                'left': '50%',
                'top': '47%',
                'transform': 'translateX(-50%)',
                'width': '60px',
                'height': '10px',
                'background-color': '#ff0000',
                'border-radius': '10px',
                'border': '2px solid #cc0000'
            });
            break;
            
        case 'blue-bandana':
            $accessory = $('<div class="accessory bandana"></div>');
            $accessory.css({
                'position': 'absolute',
                'top': '50%',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'width': '60px',
                'height': '60px',
                'border-left': '30px solid transparent',
                'border-right': '30px solid transparent',
                'border-top': '25px solid #0066ff'
            });
            break;
            
        case 'crown':
            $accessory = $('<div class="accessory crown">👑</div>');
            $accessory.css({
                'position': 'absolute',
                'top': '-10%',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'font-size': '30px'
            });
            break;
            
        default:
            return null;
    }
    
    return $accessory;
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
}

// Purchase an item
function purchaseItem(itemId, cost) {
    if (!window.petHealth) {
        alert('Unable to access pet health data.');
        return;
    }
    
    const currentHappiness = window.petHealth.happiness;
    
    // Check if already owned
    const owned = getOwnedItems();
    if (owned.includes(itemId)) {
        alert('You already own this item!');
        return;
    }
    
    // Check if enough happiness
    if (currentHappiness < cost) {
        alert(`Not enough happiness! You need ${cost}% but only have ${Math.round(currentHappiness)}%.`);
        return;
    }
    
    // Confirm purchase
    const itemName = SHOP_ITEMS[itemId].name;
    if (!confirm(`Purchase ${itemName} for ${cost}% happiness?`)) {
        return;
    }
    
    // Deduct happiness
    window.petHealth.happiness = Math.max(0, currentHappiness - cost);
    window.petHealth.saveHealthData();
    window.petHealth.updateHealthDisplay();
    
    // Add to owned items
    addOwnedItem(itemId);
    
    // Update UI
    updateHappinessDisplay();
    
    const $item = $(`.shop-item[data-item="${itemId}"]`);
    $item.addClass('owned');
    $item.find('.owned-badge').show();
    
    // Refresh pet preview
    renderShopPet();
    
    // Check if shop should close
    checkShopAvailability();
    
    // Show success message
    showNotification(`${itemName} purchased! 🎉`);
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
    
    // Remove after 1.5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 1500);
}
