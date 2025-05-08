/**
 * app.js - Main application initialization and module coordination
 * Acts as the entry point for the TypeSmash application
 */

const App = (function() {
    // Track loaded modules
    const modules = {
        typing: null,
        zoro: null,
        stats: null,
        utils: null,
        easterEggs: null
    };
    
    /**
     * Initialize the application
     */
    function init() {
        console.log(`Initializing ${Config.APP.NAME} ${Config.APP.VERSION}`);
        
        // Load settings from localStorage
        loadSettings();
        
        // Initialize event listeners for navigation
        initEventListeners();
        
        // Initialize modules as they become available
        // We'll add these as we implement them
        
        // Publish app initialization event
        EventBus.publish('app:initialized', null);
        
        // Emit ready event
        EventBus.publish('app:ready', null);
    }
    
    /**
     * Initialize event listeners for navigation and core app functionality
     */
    function initEventListeners() {
        // Mode switching events
        document.getElementById('timed-mode')?.addEventListener('click', () => {
            EventBus.publish('app:switchMode', 'timed');
        });
        
        document.getElementById('word-mode')?.addEventListener('click', () => {
            EventBus.publish('app:switchMode', 'word');
        });
        
        // Stats toggle
        document.getElementById('stats-toggle')?.addEventListener('click', () => {
            EventBus.publish('app:toggleStats', null);
        });
        
        // Dark mode toggle
        document.getElementById('dark-mode-toggle')?.addEventListener('click', () => {
            EventBus.publish('app:toggleDarkMode', null);
        });
        
        // Handle word count dropdown
        document.getElementById('word-mode')?.addEventListener('click', () => {
            const dropdown = document.querySelector('.word-count-dropdown');
            if (dropdown) {
                const isVisible = dropdown.classList.contains('show');
                State.update('ui.wordCountDropdownVisible', !isVisible);
            }
        });
        
        // Document click for closing dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.word-mode-container') && State.get('ui.wordCountDropdownVisible')) {
                State.update('ui.wordCountDropdownVisible', false);
            }
        });
        
        // State change handlers
        State.watch('ui.wordCountDropdownVisible', (visible) => {
            const dropdown = document.querySelector('.word-count-dropdown');
            if (dropdown) {
                if (visible) {
                    dropdown.classList.add('show');
                } else {
                    dropdown.classList.remove('show');
                }
            }
        });
        
        // Handle dark mode toggling
        State.watch('ui.darkMode', (darkMode) => {
            if (darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            // Save preference to localStorage
            localStorage.setItem(Config.STORAGE.DARK_MODE, darkMode);
        });
    }
    
    /**
     * Register a module with the app
     * @param {string} name - Module name
     * @param {Object} moduleInstance - Module instance
     */
    function registerModule(name, moduleInstance) {
        if (modules.hasOwnProperty(name)) {
            modules[name] = moduleInstance;
            console.log(`Module registered: ${name}`);
            EventBus.publish('app:moduleRegistered', { name, module: moduleInstance });
        } else {
            console.error(`Unknown module: ${name}`);
        }
    }
    
    /**
     * Get a registered module
     * @param {string} name - Module name
     * @return {Object|null} - Module instance or null if not found
     */
    function getModule(name) {
        return modules[name] || null;
    }
    
    /**
     * Load settings from localStorage
     */
    function loadSettings() {
        // Load dark mode setting
        const darkMode = localStorage.getItem(Config.STORAGE.DARK_MODE);
        if (darkMode === 'true') {
            State.update('ui.darkMode', true);
        }
        
        // Other settings can be loaded here as we implement them
    }
    
    // Public API
    return {
        init,
        registerModule,
        getModule
    };
})();

// Export for use in other modules
window.App = App;

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});