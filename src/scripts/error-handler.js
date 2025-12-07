// ===================================
// PixelPaws - Enhanced Error Handling Module
// Author: Assistant (improvements)
// ===================================

/**
 * Comprehensive error handling system for PixelPaws
 * Provides validation, logging, and user feedback
 */
const ErrorHandler = {
    // Error types
    ERROR_TYPES: {
        STORAGE: 'StorageError',
        API: 'APIError',
        GEOLOCATION: 'GeolocationError',
        FILE: 'FileError',
        VALIDATION: 'ValidationError',
        NETWORK: 'NetworkError',
        INITIALIZATION: 'InitializationError'
    },

    // Error severity levels
    SEVERITY: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    },

    // Log of all errors
    errorLog: [],
    maxLogSize: 50,

    /**
     * Initialize error handler
     */
    init() {
        console.log('Initializing ErrorHandler...');
        this.setupGlobalErrorHandlers();
        this.setupPromiseRejectionHandling();
    },

    /**
     * Setup global error handlers for uncaught exceptions
     */
    setupGlobalErrorHandlers() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: this.ERROR_TYPES.INITIALIZATION,
                severity: this.SEVERITY.HIGH,
                message: event.message,
                source: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: this.ERROR_TYPES.NETWORK,
                severity: this.SEVERITY.HIGH,
                message: 'Unhandled Promise Rejection: ' + event.reason,
                isPromiseRejection: true
            });
        });
    },

    /**
     * Setup promise rejection handling
     */
    setupPromiseRejectionHandling() {
        if (typeof Promise !== 'undefined') {
            Promise.prototype.catch = (function(originalCatch) {
                return function(onRejected) {
                    if (!onRejected || typeof onRejected !== 'function') {
                        this.then(null, (reason) => {
                            console.warn('Unhandled promise rejection:', reason);
                        });
                    }
                    return originalCatch.call(this, onRejected);
                };
            })(Promise.prototype.catch);
        }
    },

    /**
     * Log an error with details
     * @param {Object} errorDetails - Error information
     */
    logError(errorDetails) {
        const errorRecord = {
            timestamp: new Date().toISOString(),
            ...errorDetails
        };

        this.errorLog.push(errorRecord);

        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Log to console based on severity
        const logLevel = errorDetails.severity === this.SEVERITY.CRITICAL ? 'error' :
                        errorDetails.severity === this.SEVERITY.HIGH ? 'warn' : 'log';
        
        console[logLevel](`[${errorDetails.type}] ${errorDetails.message}`, errorDetails);

        // Store in localStorage for debugging
        try {
            localStorage.setItem('pixelPawsErrorLog', JSON.stringify(this.errorLog));
        } catch (e) {
            console.warn('Could not store error log in localStorage:', e);
        }

        return errorRecord;
    },

    /**
     * Get all logged errors
     */
    getErrorLog() {
        return this.errorLog;
    },

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        try {
            localStorage.removeItem('pixelPawsErrorLog');
        } catch (e) {
            console.warn('Could not clear error log from localStorage:', e);
        }
    },

    /**
     * Export error log as JSON
     */
    exportErrorLog() {
        const dataStr = JSON.stringify(this.errorLog, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pixelpaws_errors_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
};

/**
 * Safe localStorage wrapper with error handling
 */
const SafeStorage = {
    /**
     * Safely get item from localStorage
     */
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            
            try {
                return JSON.parse(item);
            } catch {
                return item; // Return as string if not JSON
            }
        } catch (error) {
            ErrorHandler.logError({
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.MEDIUM,
                message: `Failed to get "${key}" from localStorage`,
                error: error.message
            });
            return defaultValue;
        }
    },

    /**
     * Safely set item in localStorage
     */
    setItem(key, value) {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, stringValue);
            return true;
        } catch (error) {
            ErrorHandler.logError({
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.HIGH,
                message: `Failed to set "${key}" in localStorage`,
                error: error.message,
                reason: error.name === 'QuotaExceededError' ? 'Storage quota exceeded' : 'Unknown'
            });
            
            // Show user-friendly message
            if (error.name === 'QuotaExceededError') {
                showNotification('Storage is full. Please clear some data.', 'error');
            }
            return false;
        }
    },

    /**
     * Safely remove item from localStorage
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            ErrorHandler.logError({
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.MEDIUM,
                message: `Failed to remove "${key}" from localStorage`,
                error: error.message
            });
            return false;
        }
    },

    /**
     * Safely clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            ErrorHandler.logError({
                type: ErrorHandler.ERROR_TYPES.STORAGE,
                severity: ErrorHandler.SEVERITY.HIGH,
                message: 'Failed to clear localStorage',
                error: error.message
            });
            return false;
        }
    }
};

/**
 * Validation utilities for data integrity
 */
const Validator = {
    /**
     * Validate pet customization data
     */
    validatePetCustomization(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Pet customization must be an object');
            }

            const requiredFields = ['color', 'ears', 'face', 'eyes', 'tail', 'name'];
            for (const field of requiredFields) {
                if (!(field in data)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Validate color
            const validColors = ['gray', 'orange', 'brown', 'black', 'white'];
            if (!validColors.includes(data.color)) {
                throw new Error(`Invalid color: ${data.color}`);
            }

            // Validate name
            if (typeof data.name !== 'string' || data.name.length > 20) {
                throw new Error('Name must be a string with max 20 characters');
            }

            return true;
        } catch (error) {
            ErrorHandler.logError({
                type: ErrorHandler.ERROR_TYPES.VALIDATION,
                severity: ErrorHandler.SEVERITY.MEDIUM,
                message: 'Pet customization validation failed',
                error: error.message,
                data: data
            });
            throw error;
        }
    },

    /**
     * Validate health data
     */
    validateHealthData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Health data must be an object');
            }

            const stats = ['hunger', 'happiness', 'energy'];
            for (const stat of stats) {
                if (typeof data[stat] !== 'number' || data[stat] < 0 || data[stat] > 100) {
                    throw new Error(`${stat} must be a number between 0-100`);
                }
            }

            return true;
        } catch (error) {
            ErrorHandler.logError({
                type: ErrorHandler.ERROR_TYPES.VALIDATION,
                severity: ErrorHandler.SEVERITY.MEDIUM,
                message: 'Health data validation failed',
                error: error.message,
                data: data
            });
            throw error;
        }
    },

    /**
     * Validate JSON string
     */
    validateJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (error) {
            ErrorHandler.logError({
                type: ErrorHandler.ERROR_TYPES.VALIDATION,
                severity: ErrorHandler.SEVERITY.MEDIUM,
                message: 'JSON validation failed',
                error: error.message
            });
            throw new Error('Invalid JSON format');
        }
    }
};

/**
 * Safe API call wrapper with error handling
 */
async function safeFetch(url, options = {}) {
    try {
        const timeout = options.timeout || 10000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        const errorType = error.name === 'AbortError' ? 'Timeout' : error.message;
        
        ErrorHandler.logError({
            type: ErrorHandler.ERROR_TYPES.API,
            severity: ErrorHandler.SEVERITY.HIGH,
            message: `API call failed: ${url}`,
            error: errorType
        });

        throw error;
    }
}

/**
 * User notification system
 */
const Notifications = {
    queue: [],
    displayDuration: 3000,

    /**
     * Show notification with accessibility support
     */
    show(message, type = 'info', duration = this.displayDuration) {
        const notification = this.create(message, type);
        document.body.appendChild(notification);

        // Announce to screen readers
        this.announceToScreenReaders(message, type);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    /**
     * Create notification element
     */
    create(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;
        
        const style = document.createElement('style');
        if (!document.querySelector('style[data-notifications="true"]')) {
            style.setAttribute('data-notifications', 'true');
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 4px;
                    font-size: 14px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-in-out;
                }
                .notification-info { background: #3498db; color: white; }
                .notification-success { background: #27ae60; color: white; }
                .notification-warning { background: #f39c12; color: white; }
                .notification-error { background: #e74c3c; color: white; }
                .fade-out { animation: slideOut 0.3s ease-in-out; }
                @keyframes slideIn { from { transform: translateX(400px); } to { transform: translateX(0); } }
                @keyframes slideOut { from { transform: translateX(0); } to { transform: translateX(400px); } }
            `;
            document.head.appendChild(style);
        }

        return notification;
    },

    /**
     * Announce message to screen readers
     */
    announceToScreenReaders(message, type) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = `${type.toUpperCase()}: ${message}`;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }
};

// Initialize error handler when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ErrorHandler.init();
    });
} else {
    ErrorHandler.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
    window.SafeStorage = SafeStorage;
    window.Validator = Validator;
    window.safeFetch = safeFetch;
    window.Notifications = Notifications;
}
