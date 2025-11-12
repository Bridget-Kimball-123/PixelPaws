// ===================================
// PixelPaws - Play Interactions
// Author: Bridget Kimball
// ===================================

// Activity messages for each interaction type
const activityMessages = {
    pet: [
        "Aww, that feels nice! 🥰",
        "I love pets! More please! 💕",
        "You're the best! Keep petting! ✨",
        "Purr... This is amazing! 😊"
    ],
    feed: [
        "Yum! That was delicious! 😋",
        "Nom nom nom! So tasty! 🍖",
        "More food please! I'm hungry! 🤤",
        "Best meal ever! Thank you! 💚"
    ],
    fetch: [
        "I got it! Throw it again! 🎾",
        "This is so much fun! Wheee! 🏃",
        "Watch me run! So fast! ⚡",
        "Best game ever! Let's play more! 🎉"
    ],
    treat: [
        "Oh boy, a treat! Yummy! 🦴",
        "You spoil me! I love it! 💝",
        "Treats are my favorite! 🌟",
        "Can I have another? Pretty please? 🥺"
    ],
    toy: [
        "A new toy! I love it! 🧸",
        "Let's play with this! So fun! 🎈",
        "This toy is amazing! Squeak squeak! 🎪",
        "I could play all day! 🎭"
    ],
    brush: [
        "My fur looks so shiny now! ✨",
        "Brushing feels so relaxing! 💆",
        "I'm the prettiest pet ever! 👑",
        "Thanks for keeping me groomed! 🪮"
    ]
};

// Current pet mood/happiness level
let happinessLevel = 50;
let isAnimating = false;

// Initialize play interactions
document.addEventListener('DOMContentLoaded', function() {
    setupActivityButtons();
    updateHappinessDisplay();
    checkForToyClear();
});

// Check if toys should be cleared
function checkForToyClear() {
    const shouldClear = localStorage.getItem('clearToys');
    if (shouldClear === 'true') {
        const petDisplay = document.querySelector('.pet-display');
        if (petDisplay) {
            const toys = petDisplay.querySelectorAll('.persistent-toy');
            toys.forEach(toy => toy.remove());
        }
        localStorage.removeItem('clearToys');
    }
}

// Setup activity button event listeners
function setupActivityButtons() {
    const buttons = document.querySelectorAll('.activity-btn');
    buttons.forEach((button, index) => {
        const activities = ['pet', 'feed', 'fetch', 'treat', 'toy', 'brush'];
        button.addEventListener('click', () => performActivity(activities[index]));
    });
}

// Perform activity animation and update pet state
function performActivity(activityType) {
    if (isAnimating) return; // Prevent multiple animations at once
    
    isAnimating = true;
    const pet = document.querySelector('.pet');
    const speechBubble = document.querySelector('.speech-bubble p');
    const petDisplay = document.querySelector('.pet-display');
    
    // Get random message for this activity
    const messages = activityMessages[activityType];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Update speech bubble
    speechBubble.textContent = randomMessage;
    
    // Increase happiness
    happinessLevel = Math.min(100, happinessLevel + 5);
    updateHappinessDisplay();
    
    // Perform activity-specific animation
    switch(activityType) {
        case 'pet':
            petAnimation(pet);
            break;
        case 'feed':
            feedAnimation(pet, petDisplay);
            break;
        case 'fetch':
            fetchAnimation(pet, petDisplay);
            break;
        case 'treat':
            treatAnimation(pet, petDisplay);
            break;
        case 'toy':
            toyAnimation(pet, petDisplay);
            break;
        case 'brush':
            brushAnimation(pet);
            break;
    }
    
    // Show notification
    showNotification(`You ${activityType === 'pet' ? 'petted' : activityType === 'feed' ? 'fed' : activityType === 'brush' ? 'brushed' : 'played with'} your pet!`);
    
    // Reset animation lock after animation completes (reduced for faster interaction)
    setTimeout(() => {
        isAnimating = false;
    }, 1000);
}

// Animation: Pet the pet (bounce and happy wiggle)
function petAnimation(pet) {
    pet.style.animation = 'bounce 0.5s ease-in-out 3';
    
    // Add heart particles
    createHeartParticles(pet);
    
    setTimeout(() => {
        pet.style.animation = '';
    }, 1500);
}

// Animation: Feed (eating motion with food icon)
function feedAnimation(pet, petDisplay) {
    const face = pet.querySelector('.face');
    const petRect = pet.getBoundingClientRect();
    const displayRect = petDisplay.getBoundingClientRect();
    
    // Create food icon positioned at pet's mouth
    const food = document.createElement('div');
    food.className = 'food-icon';

    // Array of food emojis
    const foods = ['🍖', '🐓', '🐟', '🍔', '🥩'];
    const randomFood = foods[Math.floor(Math.random() * foods.length)];

    food.textContent = randomFood;
    
    // Different positioning for mobile vs desktop
    const isMobile = window.innerWidth <= 768;
    const foodLeft = isMobile 
        ? petRect.left - displayRect.left + petRect.width * 0.4 - 5
        : petRect.left - displayRect.left + 75;
    const foodTop = isMobile 
        ? petRect.top - displayRect.top + petRect.height * 0.5 - 50
        : petRect.top - displayRect.top + 80;
    
    food.style.cssText = `
        position: absolute;
        font-size: 40px;
        left: ${foodLeft}px;
        top: ${foodTop}px;
        animation: eatFood 1.5s ease-in-out;
        z-index: 100;
    `;
    petDisplay.appendChild(food);
    
    // Pet eating animation (mouth movement)
    face.style.animation = 'eatAnimation 0.3s ease-in-out 5';
    
    setTimeout(() => {
        food.remove();
        face.style.animation = '';
    }, 1500);
}

// Animation: Play fetch (ball bounces from bottom right, pet catches)
function fetchAnimation(pet, petDisplay) {
    const petRect = pet.getBoundingClientRect();
    const displayRect = petDisplay.getBoundingClientRect();
    
    // Remove any existing balls first
    const existingBalls = petDisplay.querySelectorAll('.ball-icon');
    existingBalls.forEach(b => b.remove());
    
    // Different paths for mobile vs desktop
    const isMobile = window.innerWidth <= 768;
    
    // Define the path points for the ball - Mobile ends closer to pet's mouth
    const pathPoints = isMobile ? [
        { right: 20, bottom: 20 },
        { right: 35, bottom: 32 },
        { right: 50, bottom: 44 },
        { right: 65, bottom: 56 },
        { right: 80, bottom: 68 },
        { right: 95, bottom: 80 },
        { right: 110, bottom: 92 },
        { right: 125, bottom: 104 },
        { right: 140, bottom: 116 },
        { right: 155, bottom: 128 },
        { right: 170, bottom: 140 },
        { right: 185, bottom: 150 }      // Mobile: End at pet's mouth (straight line)
    ] : [
        // Desktop path - perfectly straight diagonal line
        { right: 20, bottom: 20 },
        { right: 35, bottom: 28 },
        { right: 50, bottom: 37 },
        { right: 65, bottom: 45 },
        { right: 80, bottom: 54 },
        { right: 95, bottom: 62 },
        { right: 110, bottom: 71 },
        { right: 125, bottom: 79 },
        { right: 140, bottom: 88 },
        { right: 155, bottom: 96 },
        { right: 170, bottom: 105 },
        { right: 185, bottom: 113 },
        { right: 200, bottom: 122 },
        { right: 215, bottom: 130 },
        { right: 230, bottom: 139 },
        { right: 245, bottom: 147 },
        { right: 260, bottom: 156 },
        { right: 275, bottom: 164 },
        { right: 290, bottom: 173 },
        { right: 305, bottom: 181 },
        { right: 320, bottom: 190 },
        { right: 335, bottom: 200 }     // Desktop: End at pet's mouth
    ];
    
    // Create multiple ball instances along the path with delays
    pathPoints.forEach((point, index) => {
        setTimeout(() => {
            // Remove previous balls to avoid clutter (keep last 3)
            const currentBalls = petDisplay.querySelectorAll('.ball-icon');
            if (currentBalls.length > 3) {
                currentBalls[0].remove();
            }
            
            const ball = document.createElement('div');
            ball.className = 'ball-icon';
            ball.textContent = '🎾';
            
            // Check if this is the last ball
            const isLastBall = (index === pathPoints.length - 1);
            
            ball.style.cssText = `
                position: absolute !important;
                font-size: 30px;
                right: ${point.right}px;
                bottom: ${point.bottom}px;
                z-index: 1000 !important;
                pointer-events: none;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                transition: opacity 0.3s ease-out;
            `;
            
            petDisplay.appendChild(ball);
            
            // If it's the last ball, keep it visible for 2 seconds before fading
            if (isLastBall) {
                setTimeout(() => {
                    ball.style.opacity = '0';
                    setTimeout(() => ball.remove(), 300);
                }, 2000); // Stay visible for 2 seconds
            } else {
                // Fade out after a brief moment for non-final balls
                setTimeout(() => {
                    ball.style.opacity = '0';
                    setTimeout(() => ball.remove(), 200);
                }, 250);
            }
            
        }, index * 100); // 100ms between each ball = ~2.2 seconds total
    });
    
    console.log('Ball trail animation started');
    
    // Pet prepares to catch
    pet.style.animation = 'catchBall 2.2s ease-in-out';
    
    setTimeout(() => {
        console.log('Cleaning up balls');
        const remainingBalls = petDisplay.querySelectorAll('.ball-icon');
        remainingBalls.forEach(b => b.remove());
        pet.style.animation = '';
    }, 4800); // Extended to allow final ball to stay for 2 seconds (2200ms animation + 2000ms hold + 600ms fade)
}

// Animation: Give treat (treat appears at pet's mouth)
function treatAnimation(pet, petDisplay) {
    const face = pet.querySelector('.face');
    const petRect = pet.getBoundingClientRect();
    const displayRect = petDisplay.getBoundingClientRect();
    
    // Create treat icon positioned at pet's mouth
    const treat = document.createElement('div');
    treat.className = 'treat-icon';

    // Array of treat emojis
    const treats = ['🦴', '🥚', '🥕', '🍓', '🍉', '🫐', '🍏', '🫛', '🥔', '🥜'];
    const randomtreat = treats[Math.floor(Math.random() * treats.length)];

    treat.textContent = randomtreat;
    
    // Different positioning for mobile vs desktop (same as feed)
    const isMobile = window.innerWidth <= 768;
    const treatLeft = isMobile 
        ? petRect.left - displayRect.left + petRect.width * 0.4 - 5
        : petRect.left - displayRect.left + 75;
    const treatTop = isMobile 
        ? petRect.top - displayRect.top + petRect.height * 0.5 - 50
        : petRect.top - displayRect.top + 80;
    
    treat.style.cssText = `
        position: absolute;
        font-size: 35px;
        left: ${treatLeft}px;
        top: ${treatTop}px;
        animation: eatFood 1.5s ease-in-out;
        z-index: 100;
    `;
    petDisplay.appendChild(treat);
    
    // Pet eating animation (no jumping, like feed)
    face.style.animation = 'eatAnimation 0.3s ease-in-out 5';
    
    setTimeout(() => {
        treat.remove();
        face.style.animation = '';
    }, 1500);
}

// Animation: Toy time (toy appears, pet plays)
function toyAnimation(pet, petDisplay) {
    // Array of toy emojis
    const toys = ['🧸', '🧶', '🥏', '🐁', '👞', '🧦', '🎈'];
    const randomToy = toys[Math.floor(Math.random() * toys.length)];
    
    // Create persistent toy element
    const toy = document.createElement('div');
    toy.className = 'persistent-toy';
    toy.textContent = randomToy;
    
    // Get display dimensions
    const displayRect = petDisplay.getBoundingClientRect();
    const petRect = pet.getBoundingClientRect();
    
    // Calculate pet's center position relative to display
    const petCenterX = petRect.left - displayRect.left + petRect.width / 2;
    const petCenterY = petRect.top - displayRect.top + petRect.height / 2;
    
    // Generate random position that doesn't overlap with pet or speech bubble
    let left, top;
    let validPosition = false;
    
    while (!validPosition) {
        // Random position in percentage
        left = Math.random() * 80 + 5; // 5% to 85%
        top = Math.random() * 70 + 20;  // 20% to 90% (avoid top where speech bubble is)
        
        // Convert to pixels for comparison
        const toyX = (left / 100) * displayRect.width;
        const toyY = (top / 100) * displayRect.height;
        
        // Check if toy is far enough from pet center (at least 100px away)
        const distance = Math.sqrt(Math.pow(toyX - petCenterX, 2) + Math.pow(toyY - petCenterY, 2));
        
        // Also check if not in speech bubble area (top right corner)
        const inSpeechBubbleArea = (left > 60 && top < 30);
        
        if (distance > 120 && !inSpeechBubbleArea) {
            validPosition = true;
        }
    }
    
    toy.style.cssText = `
        position: absolute;
        font-size: 35px;
        left: ${left}%;
        top: ${top}%;
        z-index: 1;
        animation: toyAppear 0.8s ease-out;
        pointer-events: none;
    `;
    
    // Insert toy behind the pet
    petDisplay.insertBefore(toy, petDisplay.querySelector('.pet'));
    
    // Pet bounces excitedly
    pet.style.animation = 'playWithToy 2s ease-in-out';
    
    setTimeout(() => {
        pet.style.animation = '';
    }, 2000);
}

// Animation: Brush (sparkles appear, pet shimmers)
function brushAnimation(pet) {
    const petDisplay = document.querySelector('.pet-display');
    const petRect = pet.getBoundingClientRect();
    const displayRect = petDisplay.getBoundingClientRect();
    
    // Create brush emoji that moves across the pet
    const brush = document.createElement('div');
    brush.className = 'brush-icon';
    brush.textContent = '🪮';
    brush.style.cssText = `
        position: absolute;
        font-size: 35px;
        left: ${petRect.left - displayRect.left}px;
        top: ${petRect.top - displayRect.top + 50}px;
        animation: brushMove 1.5s ease-in-out;
        pointer-events: none;
        z-index: 100;
    `;
    petDisplay.appendChild(brush);
    
    // Create sparkle particles
    createSparkleParticles(pet);
    
    setTimeout(() => {
        brush.remove();
        pet.style.animation = '';
    }, 1500);
}

// Helper: Create heart particles
function createHeartParticles(pet) {
    const petDisplay = document.querySelector('.pet-display');
    const petRect = pet.getBoundingClientRect();
    const displayRect = petDisplay.getBoundingClientRect();
    
    // Pick one random area on the pet to "pet"
    const petAreaX = petRect.left - displayRect.left + (Math.random() * petRect.width);
    const petAreaY = petRect.top - displayRect.top + (Math.random() * petRect.height);
    
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.textContent = '💕';
        heart.className = 'particle';
        
        // All hearts spawn near the same area (within 45px for more spread)
        const randomX = petAreaX + (Math.random() * 50 - 25);
        const randomY = petAreaY + (Math.random() * 50 - 25);
        
        heart.style.cssText = `
            position: absolute;
            font-size: 20px;
            left: ${randomX}px;
            top: ${randomY}px;
            animation: floatUp 1.5s ease-out forwards;
            animation-delay: ${i * 0.1}s;
            pointer-events: none;
            z-index: 100;
        `;
        petDisplay.appendChild(heart);
        
        setTimeout(() => heart.remove(), 1600);
    }
}

// Helper: Create sparkle particles
function createSparkleParticles(pet) {
    const petDisplay = document.querySelector('.pet-display');
    const petRect = pet.getBoundingClientRect();
    const displayRect = petDisplay.getBoundingClientRect();
    
    // Calculate pet boundaries relative to display
    const petLeft = petRect.left - displayRect.left;
    const petTop = petRect.top - displayRect.top;
    
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.className = 'particle';
        
        // Sparkles appear within pet boundaries
        const sparkleLeft = petLeft + Math.random() * petRect.width;
        const sparkleTop = petTop + Math.random() * petRect.height;
        
        sparkle.style.cssText = `
            position: absolute;
            font-size: 18px;
            left: ${sparkleLeft}px;
            top: ${sparkleTop}px;
            animation: sparkleFloat 1.2s ease-out forwards;
            animation-delay: ${i * 0.1}s;
            pointer-events: none;
            z-index: 100;
        `;
        petDisplay.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1300);
    }
}

// Update happiness display (optional - for future enhancement)
function updateHappinessDisplay() {
    // Could add a happiness meter in the future
    console.log(`Pet happiness: ${happinessLevel}%`);
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    /* Float up animation for hearts */
    @keyframes floatUp {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
        }
    }
    
    /* Sparkle float animation */
    @keyframes sparkleFloat {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    /* Eating animation */
    @keyframes eatAnimation {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.9); }
    }
    
    /* Eat food animation (appears and disappears at mouth) */
    @keyframes eatFood {
        0% {
            opacity: 0;
            transform: scale(0.5);
        }
        20% {
            opacity: 1;
            transform: scale(1);
        }
        80% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.5);
        }
    }
    
    /* Ball bounce from bottom right to pet */
    @keyframes ballBounceToPet {
        /* Start at bottom right corner */
        0% {
            right: 20px;
            bottom: 20px;
            opacity: 1;
        }
        /* Early rise */
        10% {
            right: 70px;
            bottom: 80px;
        }
        /* Continue rising */
        20% {
            right: 130px;
            bottom: 140px;
        }
        /* Still rising */
        30% {
            right: 180px;
            bottom: 180px;
        }
        /* Approaching peak */
        40% {
            right: 220px;
            bottom: 210px;
        }
        /* Peak of the throw (highest point) */
        50% {
            right: 260px;
            bottom: 220px;
        }
        /* Starting to descend */
        60% {
            right: 300px;
            bottom: 210px;
        }
        /* Descending more */
        70% {
            right: 340px;
            bottom: 190px;
        }
        /* Getting closer to pet */
        80% {
            right: 390px;
            bottom: 205px;
        }
        /* Almost there */
        90% {
            right: 435px;
            bottom: 198px;
        }
        /* Final position at pet's mouth (moved up 50px more and right 25px more) */
        100% {
            right: 450px;
            bottom: 200px;
            opacity: 0;
        }
    }
    
    /* Catch ball animation */
    @keyframes catchBall {
        0%, 80% {
            transform: translateY(0);
        }
        90% {
            transform: translateY(-25px);
        }
        100% {
            transform: translateY(0);
        }
    }
    
    /* Jump animation */
    @keyframes jump {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-60px);
        }
    }
    
    /* Toy appear animation */
    @keyframes toyAppear {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
        }
        50% {
            transform: scale(1.2) rotate(180deg);
        }
        100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
        }
    }
    
    /* Toy bounce animation (removed - no longer needed) */
    
    /* Play with toy animation */
    @keyframes playWithToy {
        0%, 100% {
            transform: rotate(0deg);
        }
        25% {
            transform: rotate(-15deg) scale(1.1);
        }
        50% {
            transform: rotate(15deg) scale(1.1);
        }
        75% {
            transform: rotate(-10deg) scale(1.05);
        }
    }
    
    /* Brush move animation */
    @keyframes brushMove {
        0% {
            transform: translateX(0) rotate(-10deg);
            opacity: 0;
        }
        20% {
            opacity: 1;
        }
        50% {
            transform: translateX(100px) rotate(10deg);
            opacity: 1;
        }
        80% {
            opacity: 1;
        }
        100% {
            transform: translateX(200px) rotate(-10deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
