// ===================================
// PixelPaws - Customization JavaScript
// Author: Bridget Kimball
// ===================================

// Customization state
const petCustomization = {
    color: 'gray',
    ears: 'triangles',
    face: 'default',
    eyes: 'default',
    tail: 'default',
    name: 'Pixel'
};

// Color options with their CSS color values
const colorOptions = {
    gray: '#C0C0C0',
    orange: '#FF8C00',
    brown: '#8B4513',
    black: '#2C2C2C',
    white: 'white'
};

// Initialize customization when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCustomization();
    setupArrowButtons();
    setupFormButtons();
    updatePetDisplay();
    renderAccessories();
});

// Load customization from localStorage
function loadCustomization() {
    const saved = localStorage.getItem('petCustomization');
    if (saved) {
        Object.assign(petCustomization, JSON.parse(saved));
        // Update name input if it exists
        const nameInput = document.getElementById('pet-name');
        if (nameInput) {
            nameInput.value = petCustomization.name;
        }
    }
}

// Save customization to localStorage
function saveCustomization() {
    localStorage.setItem('petCustomization', JSON.stringify(petCustomization));
}

// Setup arrow button controls
function setupArrowButtons() {
    // Color controls
    const colorLeft = document.querySelector('[data-control="color-left"]');
    const colorRight = document.querySelector('[data-control="color-right"]');
    if (colorLeft) colorLeft.addEventListener('click', () => cycleOption('color', -1));
    if (colorRight) colorRight.addEventListener('click', () => cycleOption('color', 1));

    // Ears controls
    const earsLeft = document.querySelector('[data-control="ears-left"]');
    const earsRight = document.querySelector('[data-control="ears-right"]');
    if (earsLeft) earsLeft.addEventListener('click', () => cycleOption('ears', -1));
    if (earsRight) earsRight.addEventListener('click', () => cycleOption('ears', 1));

    // Face controls
    const faceLeft = document.querySelector('[data-control="face-left"]');
    const faceRight = document.querySelector('[data-control="face-right"]');
    if (faceLeft) faceLeft.addEventListener('click', () => cycleOption('face', -1));
    if (faceRight) faceRight.addEventListener('click', () => cycleOption('face', 1));

    // Eyes controls
    const eyesLeft = document.querySelector('[data-control="eyes-left"]');
    const eyesRight = document.querySelector('[data-control="eyes-right"]');
    if (eyesLeft) eyesLeft.addEventListener('click', () => cycleOption('eyes', -1));
    if (eyesRight) eyesRight.addEventListener('click', () => cycleOption('eyes', 1));

    // Tail controls
    const tailLeft = document.querySelector('[data-control="tail-left"]');
    const tailRight = document.querySelector('[data-control="tail-right"]');
    if (tailLeft) tailLeft.addEventListener('click', () => cycleOption('tail', -1));
    if (tailRight) tailRight.addEventListener('click', () => cycleOption('tail', 1));
}

// Cycle through options for a given feature
function cycleOption(feature, direction) {
    const options = {
        color: ['gray', 'orange', 'brown', 'black', 'white'],
        ears: ['triangles', 'round', 'floppy'],
        face: ['default', 'dog'],
        eyes: ['default', 'cat', 'cutesy'],
        tail: ['default', 'none', 'bushy']
    };

    const currentIndex = options[feature].indexOf(petCustomization[feature]);
    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) newIndex = options[feature].length - 1;
    if (newIndex >= options[feature].length) newIndex = 0;

    petCustomization[feature] = options[feature][newIndex];
    updatePetDisplay();
}

// Setup form buttons (Save and Reset)
function setupFormButtons() {
    const saveBtn = document.querySelector('[data-action="save"]');
    const resetBtn = document.querySelector('[data-action="reset"]');
    const exportBtn = document.querySelector('[data-action="export"]');
    const importBtn = document.querySelector('[data-action="import"]');
    const fileInput = document.getElementById('import-file-input');
    const nameInput = document.getElementById('pet-name');

    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (nameInput) {
                petCustomization.name = nameInput.value || 'Pixel';
            }
            saveCustomization();
            showNotification('Pet customization saved successfully!');
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Reset button clicked!');
            
            // Show confirmation modal
            showResetModal();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            exportPetData();
        });
    }

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                importPetData(file);
            }
            // Reset the file input so the same file can be selected again
            fileInput.value = '';
        });
    }
}

// Show reset confirmation modal
function showResetModal() {
    const modal = document.getElementById('resetModal');
    const yesBtn = document.getElementById('resetYes');
    const noBtn = document.getElementById('resetNo');
    
    modal.style.display = 'flex';
    
    // Handle Yes button
    const handleYes = () => {
        modal.style.display = 'none';
        performReset();
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

// Perform the actual reset
function performReset() {
    // Reset pet appearance
    petCustomization.color = 'gray';
    petCustomization.ears = 'triangles';
    petCustomization.face = 'default';
    petCustomization.eyes = 'default';
    petCustomization.tail = 'default';
    petCustomization.name = 'Pixel';
    const nameInput = document.getElementById('pet-name');
    if (nameInput) nameInput.value = 'Pixel';
    saveCustomization();
    updatePetDisplay();
    
    // Clear all toys from play page
    clearAllToys();
    
    // Clear shop purchases and equipped items
    console.log('Owned items before reset:', localStorage.getItem('petOwnedItems'));
    localStorage.removeItem('petOwnedItems');
    localStorage.removeItem('petEquippedItems');
    console.log('Owned items after reset:', localStorage.getItem('petOwnedItems'));
    
    // Re-render accessories to remove them from display immediately
    renderAccessories();
    
    // Reset health stats to 100%
    console.log('Checking for window.petHealth:', window.petHealth);
    if (window.petHealth) {
        console.log('Before reset - Hunger:', window.petHealth.hunger, 'Happiness:', window.petHealth.happiness);
        
        window.petHealth.hunger = 100;
        window.petHealth.happiness = 100;
        window.petHealth.status = 'healthy';
        window.petHealth.resetRecoveryActions();
        window.petHealth.saveHealthData();
        window.petHealth.updateHealthDisplay();
        
        console.log('After reset - Hunger:', window.petHealth.hunger, 'Happiness:', window.petHealth.happiness);
        showNotification('Pet appearance, health, and shop purchases have been reset!');
    } else {
        console.error('ERROR: window.petHealth is not available on customize page!');
        showNotification('Pet appearance has been reset!');
    }
}

// Update the pet display with current customization
function updatePetDisplay() {
    const pet = document.querySelector('.pet');
    if (!pet) return;

    // Update color
    updateColor();

    // Update ears
    updateEars();

    // Update face
    updateFace();

    // Update eyes
    updateEyes();

    // Update tail
    updateTail();

    // Update labels if they exist
    updateLabels();
    
    // Update pet name on home page if element exists
    updatePetName();
}

// Update pet color
function updateColor() {
    const color = colorOptions[petCustomization.color];
    const ears = document.querySelectorAll('.ear');
    const face = document.querySelector('.face');
    const body = document.querySelector('.body');
    const tail = document.querySelector('.tail');
    const pet = document.querySelector('.pet');

    // Add outline to entire pet container for all colors
    if (pet) {
        pet.style.filter = 'drop-shadow(0 0 1px #9673A6) drop-shadow(0 0 1px #9673A6) drop-shadow(0 0 2px #9673A6)';
    }

    ears.forEach(ear => {
        // For triangular ears, update border color
        if (ear.classList.contains('ear-round') || ear.classList.contains('ear-floppy')) {
            ear.style.backgroundColor = color;
        } else {
            ear.style.borderBottomColor = color;
        }
    });
    
    if (face) {
        face.style.backgroundColor = color;
        face.style.borderColor = 'transparent';
    }
    
    if (body) {
        body.style.backgroundColor = color;
        body.style.borderColor = 'transparent';
        
        // Set belly color based on pet color
        // If white pet, use light grey belly; otherwise use white belly
        const bellyColor = petCustomization.color === 'white' ? '#D3D3D3' : 'white';
        body.style.setProperty('--belly-color', bellyColor);
    }
    
    if (tail) {
        if (tail.classList.contains('tail-bushy')) {
            // Bushy tail with layered effect
            tail.style.backgroundColor = color;
            tail.style.boxShadow = `
                0 0 0 5px ${color},
                0 0 0 8px ${color}
            `;
        } else {
            // Regular curved tail
            tail.style.borderColor = `${color} transparent transparent ${color}`;
            tail.style.backgroundColor = 'transparent';
            tail.style.boxShadow = 'none';
        }
    }
}

// Update ears
function updateEars() {
    const earsContainer = document.querySelector('.ears');
    if (!earsContainer) return;

    // Remove existing ears and classes
    earsContainer.innerHTML = '';
    earsContainer.classList.remove('has-floppy');

    if (petCustomization.ears === 'triangles') {
        // Default triangular ears with pink inner triangles
        earsContainer.innerHTML = `
            <div class="ear"></div>
            <div class="ear"></div>
        `;
    } else if (petCustomization.ears === 'round') {
        // Round ears (no inner triangles)
        earsContainer.innerHTML = `
            <div class="ear ear-round"></div>
            <div class="ear ear-round"></div>
        `;
    } else if (petCustomization.ears === 'floppy') {
        // Floppy ears (no inner triangles)
        earsContainer.classList.add('has-floppy');
        earsContainer.innerHTML = `
            <div class="ear ear-floppy"></div>
            <div class="ear ear-floppy"></div>
        `;
    }

    // Reapply color after creating new ears
    updateColor();
}

// Update face (nose and whiskers)
function updateFace() {
    const face = document.querySelector('.face');
    if (!face) return;

    let nose = face.querySelector('.nose');
    let whiskers = face.querySelector('.whiskers');
    let dots = face.querySelector('.dog-dots');

    if (petCustomization.face === 'default') {
        // Cat face: down triangle nose with whiskers
        if (nose) {
            nose.style.borderLeft = '10px solid transparent';
            nose.style.borderRight = '10px solid transparent';
            nose.style.borderTop = '15px solid #FFB6C1';
            nose.style.borderBottom = 'none';
            nose.style.top = '55px';
        }
        if (whiskers) {
            whiskers.style.display = 'block';
        }
        // Remove dog dots if they exist
        if (dots) {
            dots.remove();
        }
    } else if (petCustomization.face === 'dog') {
        // Dog face: smaller up triangle nose with dots instead of whiskers
        if (nose) {
            nose.style.borderLeft = '8px solid transparent';
            nose.style.borderRight = '8px solid transparent';
            nose.style.borderTop = 'none';
            nose.style.borderBottom = '12px solid #000';
            nose.style.top = '60px';
        }
        // Hide whiskers
        if (whiskers) {
            whiskers.style.display = 'none';
        }
        // Create dots if they don't exist - six dots in triangular patterns
        if (!dots) {
            dots = document.createElement('div');
            dots.className = 'dog-dots';
            dots.innerHTML = `
                <div class="dog-dot" style="left: 28px; top: 55px;"></div>
                <div class="dog-dot" style="left: 33px; top: 62px;"></div>
                <div class="dog-dot" style="left: 38px; top: 55px;"></div>
                <div class="dog-dot" style="right: 28px; top: 55px;"></div>
                <div class="dog-dot" style="right: 33px; top: 62px;"></div>
                <div class="dog-dot" style="right: 38px; top: 55px;"></div>
            `;
            face.appendChild(dots);
        } else {
            dots.style.display = 'block';
        }
    }
}

// Update eyes
function updateEyes() {
    const eyesContainer = document.querySelector('.eyes');
    if (!eyesContainer) return;

    // Remove existing eyes
    eyesContainer.innerHTML = '';

    if (petCustomization.eyes === 'default') {
        // Default black circles
        eyesContainer.innerHTML = `
            <div class="eye"></div>
            <div class="eye"></div>
        `;
    } else if (petCustomization.eyes === 'cat') {
        // Cat eyes (football-shaped with slits)
        eyesContainer.innerHTML = `
            <div class="eye eye-cat">
                <div class="eye-slit"></div>
            </div>
            <div class="eye eye-cat">
                <div class="eye-slit"></div>
            </div>
        `;
    } else if (petCustomization.eyes === 'cutesy') {
        // Cutesy eyes with highlights
        eyesContainer.innerHTML = `
            <div class="eye eye-cutesy">
                <div class="eye-highlight eye-highlight-top"></div>
                <div class="eye-highlight eye-highlight-bottom"></div>
            </div>
            <div class="eye eye-cutesy">
                <div class="eye-highlight eye-highlight-top"></div>
                <div class="eye-highlight eye-highlight-bottom"></div>
            </div>
        `;
    }
}

// Update tail
function updateTail() {
    const tail = document.querySelector('.tail');
    if (!tail) return;

    // Remove bushy class first
    tail.classList.remove('tail-bushy');

    if (petCustomization.tail === 'default') {
        // Default S-curve tail
        tail.style.display = 'block';
        tail.style.width = '60px';
        tail.style.height = '100px';
        tail.style.left = '5px';
        tail.style.bottom = '25px';
        tail.style.borderRadius = '55% 45% 70% 30%';
        tail.style.rotate = '-40deg';
    } else if (petCustomization.tail === 'none') {
        // No tail
        tail.style.display = 'none';
    } else if (petCustomization.tail === 'bushy') {
        // Bushy tail - full, fluffy, curved upward
        tail.style.display = 'block';
        tail.classList.add('tail-bushy');
        tail.style.width = '65px';
        tail.style.height = '90px';
        tail.style.left = '0px';
        tail.style.bottom = '35px';
        tail.style.borderRadius = '45% 55% 50% 50%';
        tail.style.rotate = '-30deg';
    }

    // Reapply color
    updateColor();
}

// Update customization labels
// Update pet name on home page
function updatePetName() {
    const petNameElement = document.querySelector('.pet-name span');
    if (petNameElement) {
        petNameElement.textContent = petCustomization.name;
    }
}

function updateLabels() {
    const labels = {
        'color-label': petCustomization.color.charAt(0).toUpperCase() + petCustomization.color.slice(1),
        'ears-label': petCustomization.ears.charAt(0).toUpperCase() + petCustomization.ears.slice(1),
        'face-label': petCustomization.face === 'default' ? 'Cat' : 'Dog',
        'eyes-label': petCustomization.eyes.charAt(0).toUpperCase() + petCustomization.eyes.slice(1),
        'tail-label': petCustomization.tail === 'none' ? 'None' : petCustomization.tail === 'bushy' ? 'Bushy' : petCustomization.tail.charAt(0).toUpperCase() + petCustomization.tail.slice(1)
    };

    for (const [id, text] of Object.entries(labels)) {
        const label = document.getElementById(id);
        if (label) label.textContent = text;
    }
}

// Custom notification function
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

// Function to clear all toys (to be called from play.js)
function clearAllToys() {
    // Set flag in localStorage to signal toy clearing
    localStorage.setItem('clearToys', 'true');
}

// Get owned items from localStorage
function getOwnedAccessories() {
    const owned = localStorage.getItem('petOwnedItems');
    return owned ? JSON.parse(owned) : [];
}

// Get equipped items from localStorage
function getEquippedAccessories() {
    const equipped = localStorage.getItem('petEquippedItems');
    return equipped ? JSON.parse(equipped) : [];
}

// Save equipped items to localStorage
function saveEquippedAccessories(items) {
    localStorage.setItem('petEquippedItems', JSON.stringify(items));
}

// Toggle equip/unequip an accessory
function toggleEquipAccessory(itemId) {
    const equipped = getEquippedAccessories();
    const index = equipped.indexOf(itemId);
    
    if (index > -1) {
        // Unequip
        equipped.splice(index, 1);
    } else {
        // Equip
        equipped.push(itemId);
    }
    
    saveEquippedAccessories(equipped);
    renderAccessories();
    return equipped.includes(itemId);
}

// Create accessory element
function createAccessoryElement(itemId) {
    const accessory = document.createElement('div');
    accessory.className = `accessory ${itemId}`;
    
    switch(itemId) {
        case 'red-collar':
            accessory.style.cssText = `
                position: absolute;
                bottom: 45%;
                left: 50%;
                top: 47%;
                transform: translateX(-50%);
                width: 60px;
                height: 10px;
                background-color: #ff0000;
                border-radius: 10px;
                border: 2px solid #cc0000;
            `;
            break;
            
        case 'blue-bandana':
            // Check if mobile (screen width <= 768px)
            const isMobile = window.innerWidth <= 768;
            const borderSize = isMobile ? '30px' : '40px';
            const borderTop = isMobile ? '35px' : '40px';
            
            accessory.style.cssText = `
                position: absolute;
                top: 48%;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: ${borderSize} solid transparent;
                border-right: ${borderSize} solid transparent;
                border-top: ${borderTop} solid #0066ff;
            `;
            break;
            
        case 'crown':
            accessory.textContent = '👑';
            accessory.style.cssText = `
                position: absolute;
                top: -10%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 30px;
            `;
            break;
            
        default:
            return null;
    }
    
    return accessory;
}

// Render accessories on pet
function renderAccessories() {
    const pet = document.querySelector('.pet');
    if (!pet) return;
    
    // Get or create accessories container
    let accessoriesContainer = pet.querySelector('.pet-accessories');
    if (!accessoriesContainer) {
        accessoriesContainer = document.createElement('div');
        accessoriesContainer.className = 'pet-accessories';
        pet.appendChild(accessoriesContainer);
    }
    
    // Clear existing accessories
    accessoriesContainer.innerHTML = '';
    
    // Only add EQUIPPED accessories (not just owned)
    const equipped = getEquippedAccessories();
    equipped.forEach(itemId => {
        const accessory = createAccessoryElement(itemId);
        if (accessory) {
            accessoriesContainer.appendChild(accessory);
        }
    });
}

// Export pet data as JSON file
function exportPetData() {
    // Gather all pet data
    const petData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        customization: petCustomization,
        ownedItems: getOwnedAccessories(),
        equippedItems: getEquippedAccessories(),
        health: null
    };

    // Include health data if available
    if (window.petHealth) {
        petData.health = {
            hunger: window.petHealth.hunger,
            happiness: window.petHealth.happiness,
            status: window.petHealth.status
        };
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(petData, null, 2);
    
    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Use pet name in filename
    const petName = petCustomization.name || 'Pixel';
    const filename = `${petName}_PixelPaws_${new Date().toISOString().split('T')[0]}.json`;
    
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    showNotification('Pet data exported successfully!');
}

// Import pet data from JSON file
function importPetData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const petData = JSON.parse(e.target.result);
            
            // Validate the data structure
            if (!petData.version || !petData.customization) {
                throw new Error('Invalid pet data file');
            }
            
            // Import customization
            if (petData.customization) {
                Object.assign(petCustomization, petData.customization);
                saveCustomization();
                
                // Update name input if present
                const nameInput = document.getElementById('pet-name');
                if (nameInput && petCustomization.name) {
                    nameInput.value = petCustomization.name;
                }
            }
            
            // Import owned accessories
            if (petData.ownedItems) {
                localStorage.setItem('petOwnedItems', JSON.stringify(petData.ownedItems));
            }
            
            // Import equipped accessories
            if (petData.equippedItems) {
                localStorage.setItem('petEquippedItems', JSON.stringify(petData.equippedItems));
            }
            
            // Import health data if available
            if (petData.health && window.petHealth) {
                window.petHealth.hunger = petData.health.hunger || 100;
                window.petHealth.happiness = petData.health.happiness || 100;
                window.petHealth.status = petData.health.status || 'healthy';
                window.petHealth.saveHealthData();
                window.petHealth.updateHealthDisplay();
            }
            
            // Update displays
            updatePetDisplay();
            renderAccessories();
            
            showNotification(`Pet data imported successfully! Welcome back, ${petCustomization.name}!`);
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing pet data. Please check the file and try again.');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
}

// Export for use in other pages
if (typeof window !== 'undefined') {
    window.petCustomization = petCustomization;
    window.updatePetDisplay = updatePetDisplay;
    window.clearAllToys = clearAllToys;
    window.renderAccessories = renderAccessories;
    window.getOwnedAccessories = getOwnedAccessories;
    window.getEquippedAccessories = getEquippedAccessories;
    window.saveEquippedAccessories = saveEquippedAccessories;
    window.toggleEquipAccessory = toggleEquipAccessory;
}

