# PixelPaws Sound Effects Guide

## Overview
Sound effects have been integrated throughout the PixelPaws web app to provide audio feedback for user interactions. All sounds are managed through the centralized `soundManager` system located in `src/scripts/sound-manager.js`.

## Sound Effects Added

### Pet Interactions (Play Page)
| Sound Effect | Trigger | Action |
|---|---|---|
| **pet** | Petting the pet | Plays when user clicks the "Pet" button |
| **feed** | Feeding the pet | Plays when user clicks the "Feed" button |
| **fetch** | Playing fetch | Plays when user clicks the "Fetch" button |
| **treat** | Giving a treat | Plays when user clicks the "Treat" button |
| **toy** | Giving a toy | Plays when user clicks the "Toy" button |
| **brush** | Brushing the pet | Plays when user clicks the "Brush" button |

### Customization (Customize Page)
| Sound Effect | Trigger | Action |
|---|---|---|
| **cycle** | Cycling pet features | Plays when user clicks arrow buttons to change pet color, ears, face, eyes, or tail |
| **save** | Saving customization | Plays when user clicks "Save Pet" button to save customizations |
| **reset** | Resetting pet | Plays when user confirms resetting the pet to default appearance |

### Shop (Shop Page)
| Sound Effect | Trigger | Action |
|---|---|---|
| **purchase** | Successful item purchase | Plays when user successfully buys an accessory with happiness currency |
| **insufficient** | Failed purchase attempt | Plays when user tries to buy an item but doesn't have enough happiness |

### Themes (Themes Page)
| Sound Effect | Trigger | Action |
|---|---|---|
| **checkin** | Daily check-in (duplicate day) | Plays when user checks in on a day they've already visited |
| **unlock** | New theme unlocked | Plays when user unlocks a new theme through daily loyalty check-in |
| **reset** | Resetting themes | Plays when user resets themes to default |
| **click** | Theme selection | Plays when user selects a theme to apply |

### General UI
| Sound Effect | Trigger | Action |
|---|---|---|
| **notification** | Reserved | Available for future notification systems |
| **click** | Various UI interactions | Button clicks throughout the app |

## Sound Manager Features

### Location
- File: `src/scripts/sound-manager.js`
- Automatically initialized on all pages via script tag in HTML `<head>`

### Methods
```javascript
// Play a sound effect
soundManager.play('pet');

// Set volume (0 to 1)
soundManager.setVolume(0.7);

// Toggle sounds on/off
soundManager.toggleSounds(true);

// Get current volume
soundManager.getVolume();

// Check if sounds are enabled
soundManager.areSoundsEnabled();
```

### Features
- **Persistent Settings**: Volume and enabled/disabled state are saved to localStorage
- **Error Handling**: Gracefully handles missing or failed audio playback
- **Global Access**: Available as `soundManager` object on all pages
- **Configurable**: Easy to add new sound effects or adjust volume

### localStorage Keys
- `pixelpaws-sound-volume`: Stores user's volume preference (0-1)
- `pixelpaws-sounds-enabled`: Stores whether sounds are enabled (true/false)

## Integration Points

### Files Modified
1. **HTML Files** (Added sound-manager.js script tag):
   - `/index.html` (Home page)
   - `/src/play.html` (Play page)
   - `/src/shop.html` (Shop page)
   - `/src/customize.html` (Customize page)
   - `/src/themes.html` (Themes page)

2. **JavaScript Files** (Added sound effect calls):
   - `/src/scripts/play.js` - Pet interaction sounds
   - `/src/scripts/shop.js` - Purchase and currency sounds
   - `/src/scripts/custom.js` - Customization sounds
   - `/src/scripts/themes-page.js` - Theme unlock and check-in sounds

## Future Enhancements

### Possible Additions
- Sound effect settings panel on a dedicated settings page
- Different sound packs to choose from
- Volume control slider in UI
- Mute button in header
- Sound effects for achievements/milestones
- Ambient background music option
- Pet vocalization sounds (meows, barks, etc.)

### Current Implementation Notes
- All sounds currently use placeholder WAV data (minimal audio files)
- To replace with actual sound files, update the base64 data URIs in `soundManager.sounds`
- Sounds can be played multiple times rapidly without overlapping due to audio element reset
