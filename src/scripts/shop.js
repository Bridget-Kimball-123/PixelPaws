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
});

function initShop() {
    // Load current happiness from health system
    updateHappinessDisplay();
    
    // Check if shop should be open
    checkShopAvailability();
    
    // Load owned items
    loadOwnedItems();
    
    // Render pet with customizations
    renderShopPet();
    
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

// Render pet with current customizations
function renderShopPet() {
    // Load pet customizations from customize page
    const customizations = JSON.parse(localStorage.getItem('petCustomizations') || '{}');
    const $pet = $('.pet-preview .pet');
    
    // Apply body color
    if (customizations.bodyColor) {
        $pet.find('.face, .body').css('background-color', customizations.bodyColor);
    }
    
    // Apply ear color
    if (customizations.earColor) {
        $pet.find('.ear').css('background-color', customizations.earColor);
    }
    
    // Apply eye color
    if (customizations.eyeColor) {
        $pet.find('.eye').css('background-color', customizations.eyeColor);
    }
    
    // Load and display owned accessories
    const owned = getOwnedItems();
    const $accessories = $pet.find('.pet-accessories');
    $accessories.empty();
    
    owned.forEach(itemId => {
        const accessory = createAccessoryElement(itemId);
        if (accessory) {
            $accessories.append(accessory);
        }
    });
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
                'transform': 'translateX(-50%)',
                'width': '40px',
                'height': '15px',
                'background-color': '#ff0000',
                'border-radius': '10px',
                'border': '2px solid #cc0000'
            });
            break;
            
        case 'blue-bandana':
            $accessory = $('<div class="accessory bandana"></div>');
            $accessory.css({
                'position': 'absolute',
                'top': '20%',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'width': '0',
                'height': '0',
                'border-left': '25px solid transparent',
                'border-right': '25px solid transparent',
                'border-top': '25px solid #0066ff'
            });
            break;
            
        case 'crown':
            $accessory = $('<div class="accessory crown">👑</div>');
            $accessory.css({
                'position': 'absolute',
                'top': '5%',
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
