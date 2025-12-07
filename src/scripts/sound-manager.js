// ===================================
// PixelPaws - Sound Manager
// Author: Bridget Kimball
// Description: Centralized audio management for all sound effects
// ===================================

const soundManager = {
    // Audio context for generating sounds
    audioContext: null,

    // Volume settings (0 to 1)
    volume: 0.7,
    enabled: true,

    // Initialize sound manager
    init() {
        // Create audio context
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }

        // Load volume preference from localStorage
        const savedVolume = localStorage.getItem('pixelpaws-sound-volume');
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }

        const soundsEnabled = localStorage.getItem('pixelpaws-sounds-enabled');
        if (soundsEnabled !== null) {
            this.enabled = JSON.parse(soundsEnabled);
        }
    },

    // Generate and play a beep sound with specified frequency and duration
    playBeep(frequency = 800, duration = 200, type = 'sine') {
        if (!this.enabled || !this.audioContext) {
            return;
        }

        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            // Create oscillator
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = frequency;
            
            // Create gain node for volume and fade
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(this.volume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
            
            // Connect and play
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    },

    // Play specific sound effects based on action
    play(soundName) {
        if (!this.enabled) {
            return;
        }

        switch(soundName) {
            // Pet interactions
            case 'pet':
                // Gentle petting sound - soft scratchy texture
                this.playNoiseSound(150, 'highpass');
                break;
            case 'feed':
                // Crunching/chewing sound
                this.playCrunchSound();
                break;
            case 'fetch':
                // Throwing sound followed by bouncing
                this.playThrowAndBounceSound();
                break;
            case 'treat':
                // Quick munching/chomping sound
                this.playMunchSound();
                break;
            case 'toy':
                // Squeaky toy sound
                this.playSqueakyToySound();
                break;
            case 'brush':
                // Brushing/scratching sound
                this.playBrushingSound();
                break;
            
            // Customize page
            case 'cycle':
                // Smooth whoosh sound
                this.playWhooshSound();
                break;
            case 'save':
                // Positive confirmation chord
                this.playConfirmSound();
                break;
            case 'reset':
                // Warning/reset sound - descending
                this.playResetSound();
                break;
            
            // Shop
            case 'purchase':
                // Success fanfare
                this.playPurchaseSound();
                break;
            case 'equip':
                // Equip/accessory sound
                this.playEquipSound();
                break;
            case 'insufficient':
                // Error/failure buzz
                this.playErrorSound();
                break;
            
            // Themes
            case 'unlock':
                // Triumphant unlock sound
                this.playUnlockSound();
                break;
            case 'checkin':
                // Cheerful check-in sound
                this.playCheckinSound();
                break;
            case 'theme':
                // Theme selection sound
                this.playThemeSound();
                break;
            
            // General UI
            case 'click':
                this.playBeep(500, 80);
                break;
            case 'notification':
                this.playBeep(900, 150);
                setTimeout(() => this.playBeep(1100, 150), 100);
                break;
            default:
                console.warn('Unknown sound:', soundName);
        }
    },

    // Crunching/chewing sound for feeding
    playCrunchSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const duration = 0.4;

        // Create noise burst for crunching
        for (let i = 0; i < 3; i++) {
            this.playNoiseSound(100 + i * 50, 'bandpass', 0.1, now + i * 0.08);
        }
    },

    // Munching/chomping sound for treats
    playMunchSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Quick succession of crunches
        this.playNoiseSound(80, 'highpass', 0.08, now);
        setTimeout(() => this.playNoiseSound(120, 'highpass', 0.08), 60);
        setTimeout(() => this.playNoiseSound(100, 'highpass', 0.08), 120);
    },

    // Throwing sound followed by ball bounce
    playThrowAndBounceSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Whoosh/throw sound - downward pitch sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);

        // Bounce sounds - high-pitched bounces
        setTimeout(() => this.playBeep(800, 80), 120);
        setTimeout(() => this.playBeep(600, 70), 200);
        setTimeout(() => this.playBeep(400, 60), 270);
    },

    // Squeaky toy sound
    playSqueakyToySound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Multiple squeaks at different pitches
        const pitches = [1200, 1400, 1100, 1300];
        pitches.forEach((pitch, index) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = pitch;
                gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.15);
            }, index * 120);
        });
    },

    // Brushing/scratching sound
    playBrushingSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Continuous scratchy texture
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.playNoiseSound(150, 'highpass', 0.12);
            }, i * 80);
        }
    },

    // Smooth whoosh sound for cycling
    playWhooshSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.15);
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    },

    // Positive confirmation sound for saving
    playConfirmSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [
            { freq: 523, time: 0 },      // C5
            { freq: 659, time: 0.1 },    // E5
            { freq: 784, time: 0.2 }     // G5
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.volume * 0.3, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.15);
        });
    },

    // Descending reset sound
    playResetSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [
            { freq: 800, time: 0 },
            { freq: 600, time: 0.1 },
            { freq: 400, time: 0.2 }
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.volume * 0.3, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.15);
        });
    },

    // Success purchase fanfare
    playPurchaseSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [
            { freq: 659, time: 0 },      // E5
            { freq: 784, time: 0.08 },   // G5
            { freq: 1047, time: 0.16 }   // C6
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.volume * 0.5, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.2);
        });
    },

    // Equipment/accessory equip sound
    playEquipSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Quick sparkly dual-note sound
        const notes = [
            { freq: 1047, time: 0 },     // C6
            { freq: 1319, time: 0.05 }   // E6
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.volume * 0.4, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.15);
        });
    },

    // Error buzz sound
    playErrorSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    },

    // Triumphant unlock sound
    playUnlockSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [
            { freq: 523, time: 0 },      // C5
            { freq: 659, time: 0.1 },    // E5
            { freq: 784, time: 0.2 },    // G5
            { freq: 1047, time: 0.3 }    // C6
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.volume * 0.3, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.2);
        });
    },

    // Cheerful check-in sound
    playCheckinSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [
            { freq: 659, time: 0 },      // E5
            { freq: 784, time: 0.08 }    // G5
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.volume * 0.3, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.15);
        });
    },

    // Theme selection sound - bright and smooth
    playThemeSound() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [
            { freq: 784, time: 0 },      // G5
            { freq: 987, time: 0.06 }    // B5
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.volume * 0.4, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.18);
        });
    },

    // Generic noise sound with filter
    playNoiseSound(frequency = 200, filterType = 'highpass', duration = 0.1, startTime = null) {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = startTime || ctx.currentTime;

        const noise = ctx.createBufferSource();
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        // Fill buffer with random noise
        for (let i = 0; i < noiseBuffer.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }

        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = frequency;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.buffer = noiseBuffer;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + duration);
    },

    // Set volume (0 to 1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('pixelpaws-sound-volume', this.volume);
    },

    // Toggle sounds on/off
    toggleSounds(enabled) {
        this.enabled = enabled;
        localStorage.setItem('pixelpaws-sounds-enabled', JSON.stringify(this.enabled));
    },

    // Get current volume
    getVolume() {
        return this.volume;
    },

    // Check if sounds are enabled
    areSoundsEnabled() {
        return this.enabled;
    }
};

// Initialize sound manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    soundManager.init();
});
