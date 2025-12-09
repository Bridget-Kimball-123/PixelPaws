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

// Undo/Redo history system
const customizationHistory = {
    undoStack: [],
    redoStack: [],
    maxHistorySize: 50,

    // Save current state to undo stack
    saveState(state) {
        // Convert to JSON and back to create a deep copy
        this.undoStack.push(JSON.parse(JSON.stringify(state)));
        
        // Limit history size
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when a new action is performed
        this.redoStack = [];
        
        // Update button states
        updateUndoRedoButtons();
    },

    // Perform undo
    undo() {
        if (this.undoStack.length === 0) return null;
        
        // Save current state to redo stack
        this.redoStack.push(JSON.parse(JSON.stringify(petCustomization)));
        
        // Restore previous state
        const previousState = this.undoStack.pop();
        Object.assign(petCustomization, previousState);
        
        // Update button states
        updateUndoRedoButtons();
        
        return previousState;
    },

    // Perform redo
    redo() {
        if (this.redoStack.length === 0) return null;
        
        // Save current state to undo stack
        this.undoStack.push(JSON.parse(JSON.stringify(petCustomization)));
        
        // Restore next state
        const nextState = this.redoStack.pop();
        Object.assign(petCustomization, nextState);
        
        // Update button states
        updateUndoRedoButtons();
        
        return nextState;
    },

    // Clear history (used on reset or save)
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        updateUndoRedoButtons();
    }
};

// Update undo/redo button disabled states
function updateUndoRedoButtons() {
    const undoBtn = document.querySelector('[data-action="undo"]');
    const redoBtn = document.querySelector('[data-action="redo"]');
    
    if (undoBtn) {
        // Add visual disabled state without actually disabling the button
        if (customizationHistory.undoStack.length === 0) {
            undoBtn.classList.add('btn-disabled');
            undoBtn.setAttribute('aria-disabled', 'true');
        } else {
            undoBtn.classList.remove('btn-disabled');
            undoBtn.setAttribute('aria-disabled', 'false');
        }
    }
    if (redoBtn) {
        // Add visual disabled state without actually disabling the button
        if (customizationHistory.redoStack.length === 0) {
            redoBtn.classList.add('btn-disabled');
            redoBtn.setAttribute('aria-disabled', 'true');
        } else {
            redoBtn.classList.remove('btn-disabled');
            redoBtn.setAttribute('aria-disabled', 'false');
        }
    }
}

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
    updateUndoRedoButtons();
});

// Store previous customization state for change detection
let previousCustomization = {};

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
    // Store the initial state for change detection
    previousCustomization = JSON.parse(JSON.stringify(petCustomization));
}

// Check if customization has actually changed
function hasCustomizationChanged() {
    return previousCustomization.color !== petCustomization.color ||
           previousCustomization.pattern !== petCustomization.pattern ||
           previousCustomization.eye !== petCustomization.eye ||
           previousCustomization.mouth !== petCustomization.mouth ||
           previousCustomization.accessory !== petCustomization.accessory ||
           previousCustomization.name !== petCustomization.name;
}

// Save customization to localStorage (internal - no achievement check)
function saveCustomizationInternal() {
    localStorage.setItem('petCustomization', JSON.stringify(petCustomization));
}

// Save customization to localStorage with achievement checking (only for manual save)
function saveCustomization() {
    // Check if anything actually changed before saving
    const hasChanged = hasCustomizationChanged();
    
    saveCustomizationInternal();
    
    // Only check achievements if customization actually changed AND this is a manual save
    if (hasChanged && window.achievements) {
        console.log('Customization changed - checking achievements');
        // Mark that user has saved a customization
        localStorage.setItem('petHasSavedCustomization', 'true');
        window.achievements.checkAll();
        // Update the previous state after checking achievements
        previousCustomization = JSON.parse(JSON.stringify(petCustomization));
    }
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

    // Save current state before making changes
    customizationHistory.saveState(petCustomization);

    const currentIndex = options[feature].indexOf(petCustomization[feature]);
    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) newIndex = options[feature].length - 1;
    if (newIndex >= options[feature].length) newIndex = 0;

    petCustomization[feature] = options[feature][newIndex];
    
    // Play cycle sound effect
    if (typeof soundManager !== 'undefined') {
        soundManager.play('cycle');
    }
    
    updatePetDisplay();
}

// Setup form buttons (Save and Reset)
function setupFormButtons() {
    const saveBtn = document.querySelector('[data-action="save"]');
    const resetBtn = document.querySelector('[data-action="reset"]');
    const undoBtn = document.querySelector('[data-action="undo"]');
    const redoBtn = document.querySelector('[data-action="redo"]');
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
            // Clear undo/redo history on save
            customizationHistory.clear();
            // Play save sound effect
            if (typeof soundManager !== 'undefined') {
                soundManager.play('save');
            }
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

    if (undoBtn) {
        undoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const previousState = customizationHistory.undo();
            if (previousState) {
                updatePetDisplay();
                // Update name input if it changed
                if (nameInput) {
                    nameInput.value = petCustomization.name;
                }
                // Play cycle sound for feedback
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('cycle');
                }
            } else {
                // Show notification when there's nothing to undo
                showNotification('Nothing to undo!');
            }
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const nextState = customizationHistory.redo();
            if (nextState) {
                updatePetDisplay();
                // Update name input if it changed
                if (nameInput) {
                    nameInput.value = petCustomization.name;
                }
                // Play cycle sound for feedback
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('cycle');
                }
            } else {
                // Show notification when there's nothing to redo
                showNotification('Nothing to redo!');
            }
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
    // Use internal save without achievement check
    saveCustomizationInternal();
    // Update previous state so achievements aren't triggered
    previousCustomization = JSON.parse(JSON.stringify(petCustomization));
    updatePetDisplay();
    
    // Clear undo/redo history on reset
    customizationHistory.clear();
    
    // Play reset sound effect
    if (typeof soundManager !== 'undefined') {
        soundManager.play('reset');
    }
    
    // Clear all toys from play page
    clearAllToys();
    
    // Clear shop purchases and equipped items
    console.log('Owned items before reset:', localStorage.getItem('petOwnedItems'));
    localStorage.removeItem('petOwnedItems');
    localStorage.removeItem('petEquippedItems');
    localStorage.removeItem('petFavorites');
    localStorage.removeItem('petAchievements');
    localStorage.removeItem('petHasSavedCustomization');
    localStorage.removeItem('petHasPlayedWithPet');
    localStorage.removeItem('petHasReturned');
    console.log('Owned items after reset:', localStorage.getItem('petOwnedItems'));
    
    // Re-render accessories to remove them from display immediately
    renderAccessories();
    
    // Reset theme and loyalty progress
    if (window.petTheme) {
        window.petTheme.resetTheme();
        console.log('Theme reset to default');
    }
    
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
        showNotification('Customizations and preferences have been reset!');
    } else {
        console.error('ERROR: window.petHealth is not available on customize page!');
        showNotification('Customizations and preferences have been reset!');
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
        saveEquippedAccessories(equipped);
        renderAccessories();
        return false;
    } else {
        // Check if trying to equip an item of a type that's already equipped
        const itemType = SHOP_ITEMS[itemId]?.type;
        if (itemType && itemType !== 'friend') {
            // For non-friend types, only one can be equipped at a time
            // Find any equipped item of the same type
            const sameTypeIndex = equipped.findIndex(equippedId => 
                SHOP_ITEMS[equippedId]?.type === itemType
            );
            if (sameTypeIndex > -1) {
                // There's a conflict - show confirmation modal
                showAccessoryConflictModal(itemId, equipped[sameTypeIndex], itemType);
                return equipped.includes(itemId);
            }
        }
        // Equip the new item (friends can have multiple equipped)
        equipped.push(itemId);
        saveEquippedAccessories(equipped);
        renderAccessories();
        return true;
    }
}

// Show modal for accessory type conflict
function showAccessoryConflictModal(newItemId, currentItemId, itemType) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    
    const newItemName = SHOP_ITEMS[newItemId]?.name || 'Item';
    const currentItemName = SHOP_ITEMS[currentItemId]?.name || 'Current item';
    const typeDisplayName = SHOP_ITEMS[newItemId]?.displayType || itemType;
    
    const message = `Only one ${typeDisplayName.toLowerCase()} is allowed at a time. You currently have "${currentItemName}" equipped. Would you like to unequip it and equip "${newItemName}" instead?`;
    
    document.getElementById('confirmMessage').textContent = message;
    
    // Clear previous event listeners by cloning
    const confirmYesBtn = document.getElementById('confirmYes');
    const newConfirmYesBtn = confirmYesBtn.cloneNode(true);
    confirmYesBtn.parentNode.replaceChild(newConfirmYesBtn, confirmYesBtn);
    
    const confirmNoBtn = document.getElementById('confirmNo');
    const newConfirmNoBtn = confirmNoBtn.cloneNode(true);
    confirmNoBtn.parentNode.replaceChild(newConfirmNoBtn, confirmNoBtn);
    
    // Set up new event listeners
    document.getElementById('confirmYes').addEventListener('click', () => {
        // Confirm the swap
        const equipped = getEquippedAccessories();
        const sameTypeIndex = equipped.findIndex(equippedId => 
            SHOP_ITEMS[equippedId]?.type === itemType
        );
        if (sameTypeIndex > -1) {
            equipped.splice(sameTypeIndex, 1);
        }
        equipped.push(newItemId);
        saveEquippedAccessories(equipped);
        renderAccessories();
        
        // Update shop UI buttons
        if (window.loadOwnedItems) {
            window.loadOwnedItems();
        }
        
        // Update pet preview
        if (window.renderShopAccessories) {
            window.renderShopAccessories();
        }
        
        modal.style.display = 'none';
    });
    
    document.getElementById('confirmNo').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Update modal title
    const modalHeader = document.getElementById('modalTitle');
    if (modalHeader) {
        modalHeader.textContent = `${typeDisplayName} Conflict`;
    }
    
    modal.style.display = 'flex';
}

// Create accessory element
function createAccessoryElement(itemId) {
    const accessory = document.createElement('div');
    accessory.className = `accessory ${itemId}`;
    
    switch(itemId) {
        case 'pink-collar':
            accessory.style.cssText = `
                position: absolute;
                bottom: 45%;
                left: 50%;
                top: 47%;
                transform: translateX(-50%);
                width: 65px;
                height: 10px;
                background-color: #fe93daff;
                border-radius: 10px;
                border: 2px solid #ff74d1ff;
                z-index: 10;
            `;
            break;
            
        case 'blue-bandana':
            // Check if mobile (screen width <= 768px)
            const isMobile = window.innerWidth <= 768;
            const borderSize = isMobile ? '30px' : '40px';
            const borderTop = isMobile ? '35px' : '40px';
            
            accessory.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: ${borderSize} solid transparent;
                border-right: ${borderSize} solid transparent;
                border-top: ${borderTop} solid #0066ff;
                z-index: 9;
            `;
            break;
            
        case 'crown':
            accessory.textContent = '👑';
            accessory.style.cssText = `
                position: absolute;
                top: -5%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 30px;
            `;
            break;
            
        case 'green-sweater':
            // Green sweater with cable knit pattern - rectangular with very rounded corners
            const sweaterSVG = `
                <svg viewBox="0 0 142 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <!-- Main sweater body - rectangle with very rounded corners -->
                    <rect x="8" y="15" width="127" height="110" rx="35" ry="35" fill="#228B22" stroke="#1a6b1a" stroke-width="1.5"/>
                    
                    <!-- Cable knit pattern (kept within bounds) -->
                    <g stroke="#1a6b1a" stroke-width="1.2" opacity="0.5" fill="none" stroke-linecap="round">
                        <!-- Left side cable -->
                        <path d="M 20 30 Q 22 40 20 50 Q 22 60 20 70 Q 22 80 20 90 Q 22 100 20 110"/>
                        <path d="M 28 28 Q 30 38 28 48 Q 30 58 28 68 Q 30 78 28 88 Q 30 98 28 112"/>
                        <path d="M 36 30 Q 38 40 36 50 Q 38 60 36 70 Q 38 80 36 90 Q 38 100 36 110"/>
                        
                        <!-- Left-center cable -->
                        <path d="M 46 26 Q 49 36 46 46 Q 49 56 46 66 Q 49 76 46 86 Q 49 96 46 114"/>
                        <path d="M 56 25 Q 59 35 56 45 Q 59 55 56 65 Q 59 75 56 85 Q 59 95 56 115"/>
                        
                        <!-- Center cable -->
                        <path d="M 66 22 Q 69 32 66 42 Q 69 52 66 62 Q 69 72 66 82 Q 69 92 66 118"/>
                        <path d="M 74 22 Q 77 32 74 42 Q 77 52 74 62 Q 77 72 74 82 Q 77 92 74 118"/>
                        
                        <!-- Right-center cable -->
                        <path d="M 84 25 Q 87 35 84 45 Q 87 55 84 65 Q 87 75 84 85 Q 87 95 84 115"/>
                        <path d="M 94 26 Q 97 36 94 46 Q 97 56 94 66 Q 97 76 94 86 Q 97 96 94 114"/>
                        
                        <!-- Right side cable -->
                        <path d="M 104 30 Q 106 40 104 50 Q 106 60 104 70 Q 106 80 104 90 Q 106 100 104 110"/>
                        <path d="M 112 28 Q 114 38 112 48 Q 114 58 112 68 Q 114 78 112 88 Q 114 98 112 112"/>
                        <path d="M 120 30 Q 122 40 120 50 Q 122 60 120 70 Q 122 80 120 90 Q 122 100 120 110"/>
                    </g>
                    
                    <!-- Additional texture detail - subtle diamond patterns in cables -->
                    <g stroke="#0d4d0d" stroke-width="0.6" opacity="0.3" fill="none">
                        <path d="M 36 40 L 42 45 M 36 60 L 42 65 M 36 80 L 42 85 M 36 100 L 42 105"/>
                        <path d="M 98 40 L 104 45 M 98 60 L 104 65 M 98 80 L 104 85 M 98 100 L 104 105"/>
                        <path d="M 56 35 L 60 40 M 56 55 L 60 60 M 56 75 L 60 80 M 56 95 L 60 100"/>
                        <path d="M 74 35 L 78 40 M 74 55 L 78 60 M 74 75 L 78 80 M 74 95 L 78 100"/>
                    </g>
                </svg>
            `;
            accessory.innerHTML = sweaterSVG;
            accessory.style.cssText = `
                position: absolute;
                top: 75%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                width: 100%;
                height: 65%;
                z-index: 1;
            `;
            break;
            
        case 'jmu-cs-shirt':
            // Purple JMU CS shirt - circular, covers full lower body
            accessory.style.cssText = `
                position: absolute;
                top: 74%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                width: 79%;
                height: 54%;
                background-color: #6A2FA8;
                border-radius: 50%;
                border: 2px solid #4A1F7F;
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Create text overlay for the shirt
            const jmuTextDiv = document.createElement('div');
            jmuTextDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: white;
                font-family: Arial, sans-serif;
                font-weight: bold;
                width: 90%;
                z-index: 2;
            `;
            jmuTextDiv.innerHTML = `
                <div style="font-size: 14px; line-height: 1.2;">JMU</div>
                <div style="font-size: 8px; line-height: 1;">Computer</div>
                <div style="font-size: 8px;">Science</div>
            `;
            accessory.appendChild(jmuTextDiv);
            break;
            
        case 'santa-hat':
            // Create SVG for santa hat (white cuff, red cone, white pom-pom)
            const santaSVG = `
                <svg viewBox="5 -2 80 75" width="90" height="85" xmlns="http://www.w3.org/2000/svg">
                    <!-- White cuff at bottom -->
                    <rect x="5" y="42" width="70" height="10" fill="white" stroke="#333" stroke-width="1"/>
                    <!-- Red triangle cone -->
                    <polygon points="40,8 12,42 68,42" fill="#ff0000" stroke="#cc0000" stroke-width="1"/>
                    <!-- White pom-pom at top -->
                    <circle cx="40" cy="5" r="8" fill="white" stroke="#333" stroke-width="1"/>
                </svg>
            `;
            accessory.innerHTML = santaSVG;
            accessory.style.cssText = `
                position: absolute;
                top: -13%;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 75px;
            `;
            break;
            
        case 'birthday-hat':
            // Create SVG for birthday hat (flat 2D triangle with stripes)
            const birthdaySVG = `
                <svg viewBox="5 7 100 75" width="90" height="75" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <!-- Clipping path for stripes to stay inside triangle -->
                        <clipPath id="triangleClip">
                            <polygon points="50,10 10,75 90,75"/>
                        </clipPath>
                    </defs>
                    
                    <!-- Yellow triangle - point at top, flat base at bottom -->
                    <polygon points="50,10 10,75 90,75" fill="#FFD700" stroke="#333" stroke-width="1"/>
                    
                    <!-- Stripes clipped to triangle -->
                    <g clip-path="url(#triangleClip)">
                        <!-- Blue stripes (evenly spaced at 0, 26.67, 53.33 positions) -->
                        <line x1="11.33" y1="75" x2="41.33" y2="10" stroke="#0066ff" stroke-width="3"/>
                        <line x1="38" y1="75" x2="68" y2="10" stroke="#0066ff" stroke-width="3"/>
                        <line x1="64.67" y1="75" x2="94.67" y2="10" stroke="#0066ff" stroke-width="3"/>
                        
                        <!-- Pink stripes (evenly spaced at 8.89, 35.55, 62.22 positions) -->
                        <line x1="20.22" y1="75" x2="50.22" y2="10" stroke="#ff1493" stroke-width="3"/>
                        <line x1="46.89" y1="75" x2="76.89" y2="10" stroke="#ff1493" stroke-width="3"/>
                        <line x1="73.55" y1="75" x2="103.55" y2="10" stroke="#ff1493" stroke-width="3"/>
                        
                        <!-- Green stripes (evenly spaced at 17.78, 44.44, 71.11 positions) -->
                        <line x1="29.11" y1="75" x2="59.11" y2="10" stroke="#00cc00" stroke-width="3"/>
                        <line x1="55.78" y1="75" x2="85.78" y2="10" stroke="#00cc00" stroke-width="3"/>
                        <line x1="82.44" y1="75" x2="112.44" y2="10" stroke="#00cc00" stroke-width="3"/>
                    </g>
                    
                    <!-- Red circle on top point -->
                    <circle cx="50" cy="10" r="10" fill="#FF4444" stroke="#cc0000" stroke-width="1"/>
                </svg>
            `;
            accessory.innerHTML = birthdaySVG;
            accessory.style.cssText = `
                position: absolute;
                top: -15%;
                left: 45%;
                transform: translateX(-50%);
                width: 60px;
                height: 60px;
            `;
            break;
            
        case 'rubber-duckie':
            // Create SVG for rubber duckie with shorter neck
            const ducklingSVG = `
                <svg viewBox="-30 0 100 100" width="70" height="60" xmlns="http://www.w3.org/2000/svg">
                    <!-- Body -->
                    <ellipse cx="50" cy="62" rx="25" ry="28" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
                    <!-- Neck (shorter) -->
                    <rect x="45" y="42" width="10" height="8" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
                    <!-- Head -->
                    <circle cx="50" cy="30" r="15" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
                    <!-- Eyes -->
                    <circle cx="45" cy="27" r="3" fill="#000"/>
                    <circle cx="55" cy="27" r="3" fill="#000"/>
                    <!-- Beak -->
                    <ellipse cx="50" cy="35" rx="8" ry="6" fill="#FF8C00" stroke="#FF6600" stroke-width="1"/>
                    <!-- Wing lines -->
                    <path d="M 35 52 Q 30 62 35 72" stroke="#FFA500" stroke-width="1.5" fill="none"/>
                    <path d="M 65 52 Q 70 62 65 72" stroke="#FFA500" stroke-width="1.5" fill="none"/>
                </svg>
            `;
            accessory.innerHTML = ducklingSVG;
            accessory.style.cssText = `
                position: absolute;
                bottom: -5%;
                left: -10%;
                width: 60px;
                height: 60px;
                z-index: 11;
            `;
            break;
            
        case 'orange-frog':
            // Create SVG for orange frog friend
            const frogSVG = `
                <svg viewBox="0 0 300 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <!-- Back left leg -->
                    <ellipse cx="35" cy="96" rx="15" ry="22" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <!-- Back left foot with toes -->
                    <ellipse cx="33" cy="115" rx="14" ry="8" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <!-- Left toe 1 (upper left) -->
                    <ellipse cx="13" cy="120" rx="15" ry="3" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="1" cy="121" r="3.5" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    <!-- Left toe 2 (lower left) -->
                    <ellipse cx="21" cy="124" rx="15" ry="3" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="9" cy="125" r="3.5" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>

                    <!-- Back right leg -->
                    <ellipse cx="125" cy="96" rx="15" ry="22" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <!-- Back right foot with toes (mirrored from left) -->
                    <ellipse cx="127" cy="115" rx="14" ry="8" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <!-- Right toe 1 (upper right, mirrored) -->
                    <ellipse cx="147" cy="120" rx="15" ry="3" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="159" cy="121" r="3.5" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    <!-- Right toe 2 (lower right, mirrored) -->
                    <ellipse cx="139" cy="124" rx="15" ry="3" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="151" cy="125" r="3.5" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>

                    <!-- Body -->
                    <ellipse cx="80" cy="95" rx="45" ry="40" fill="#FF6B35" stroke="#CC5528" stroke-width="2"/>

                    <!-- Belly/throat area (light cream) -->
                    <ellipse cx="80" cy="105" rx="38" ry="30" fill="#F5D5B8" stroke="none"/>
                    
                    <!-- Front left leg -->
                    <ellipse cx="47" cy="100" rx="15" ry="30" fill="#FF6B35" stroke="#CC5528" stroke-width="1.5"/>
                    <!-- Left foot with toes (smaller) -->
                    <ellipse cx="45" cy="130" rx="11" ry="8" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <!-- Left toe 1 -->
                    <ellipse cx="30" cy="130" rx="2.5" ry="4" transform="rotate(45 28 140)" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="34" cy="138" r="2.8" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    <!-- Left toe 2 -->
                    <ellipse cx="45" cy="138" rx="2.5" ry="4" transform="rotate(0 43 143)" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="45" cy="142" r="2.8" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    <!-- Left toe 3 -->
                    <ellipse cx="60" cy="130" rx="2.5" ry="4" transform="rotate(-45 62 140)" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="56" cy="138" r="2.8" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    
                    <!-- Front right leg -->
                    <ellipse cx="113" cy="100" rx="15" ry="30" fill="#FF6B35" stroke="#CC5528" stroke-width="1.5"/>
                    <!-- Right foot with toes (smaller) -->
                    <ellipse cx="115" cy="130" rx="11" ry="8" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <!-- Right toe 1 -->
                    <ellipse cx="100" cy="130" rx="2.5" ry="4" transform="rotate(45 98 140)" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="104" cy="138" r="2.8" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    <!-- Right toe 2 -->
                    <ellipse cx="115" cy="138" rx="2.5" ry="4" transform="rotate(0 113 143)" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="115" cy="142" r="2.8" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    <!-- Right toe 3 -->
                    <ellipse cx="130" cy="130" rx="2.5" ry="4" transform="rotate(-45 132 140)" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    <circle cx="126" cy="138" r="2.8" fill="#F5D5B8" stroke="#CC5528" stroke-width="0.8"/>
                    
                    <!-- Head area -->
                    <ellipse cx="80" cy="60" rx="42" ry="35" fill="#FF6B35" stroke="#CC5528" stroke-width="2"/>
                    
                    <!-- Left eye orange circle behind (taller) -->
                    <ellipse cx="55" cy="40" rx="18" ry="22" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    
                    <!-- Right eye orange circle behind (taller) -->
                    <ellipse cx="105" cy="40" rx="18" ry="22" fill="#FF6B35" stroke="#CC5528" stroke-width="1"/>
                    
                    <!-- Left eye green base (shorter) -->
                    <ellipse cx="55" cy="42" rx="14" ry="17" fill="#B8D956" stroke="#3D5A1F" stroke-width="1.5"/>
                    
                    <!-- Right eye green base (shorter) -->
                    <ellipse cx="105" cy="42" rx="14" ry="17" fill="#B8D956" stroke="#3D5A1F" stroke-width="1.5"/>
                    
                    <!-- Left eye pupil (taller and slightly wider) -->
                    <ellipse cx="57" cy="42" rx="10" ry="12" fill="#000"/>
                    <!-- Left eye shine -->
                    <circle cx="59" cy="37" r="3" fill="white"/>
                    
                    <!-- Right eye pupil (taller and slightly wider) -->
                    <ellipse cx="103" cy="42" rx="10" ry="12" fill="#000"/>
                    <!-- Right eye shine -->
                    <circle cx="101" cy="37" r="3" fill="white"/>
                    
                    <!-- Smile mouth (curved smile) -->
                    <path d="M 46 78 Q 80 95 115 78" stroke="#CC5528" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <!-- Smile fill -->
                    <path d="M 46 78 Q 80 94 115 78 Q 80 82 46 78" fill="#FF6B35"/>
                    
                    <!-- Nostril left (stretched oval, tilted) -->
                    <ellipse cx="75" cy="65" rx="1.5" ry="3" fill="#CC5528" transform="rotate(-45 75 65)"/>
                    <!-- Nostril right (stretched oval, tilted) -->
                    <ellipse cx="85" cy="65" rx="1.5" ry="3" fill="#CC5528" transform="rotate(45 85 65)"/>
                </svg>
            `;
            accessory.innerHTML = frogSVG;
            accessory.style.cssText = `
                position: absolute;
                bottom: 0%;
                left: 70%;
                width: 75px;
                height: 75px;
                z-index: 11;
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
                // Use internal save without achievement check for imports
                saveCustomizationInternal();
                // Update previous state so achievements aren't triggered
                previousCustomization = JSON.parse(JSON.stringify(petCustomization));
                
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

