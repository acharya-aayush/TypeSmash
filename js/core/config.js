/**
 * config.js - Configuration settings and constants for TypeSmash
 */

const Config = (function() {
    // Core application settings
    const APP_NAME = "TypeSmash";
    const APP_VERSION = "0.8.1";
    
    // Typing test settings
    const TYPING_CONFIG = {
        DEFAULT_TIME_MODE: 15, // seconds
        DEFAULT_WORD_LIMIT: 20,
        AVAILABLE_WORD_COUNTS: [20, 50, 100, 200, 500, 1000],
        MAX_DISPLAYED_WORDS: 3,
        WORDS_PER_LINE: 14
    };
    
    // Zoro mode settings
    const ZORO_CONFIG = {
        INITIAL_LIVES: 3,
        INITIAL_GAME_SPEED: 1500, // ms between word spawns
        INITIAL_WORD_SPEED: 0.8, // pixels per frame
        POWER_UP_THRESHOLDS: {
            ONIGIRI: 5000,
            HAKI: 1000,
            ASHURA: 7500
        },
        DIFFICULTY_TIERS: [
            {name: 'East Blue', threshold: 0, color: '#4a9ae1'},
            {name: 'Paradise', threshold: 500, color: '#27ae60'},
            {name: 'Alabasta', threshold: 1000, color: '#f39c12'},
            {name: 'Skypiea', threshold: 1500, color: '#f1c40f'},
            {name: 'Water 7', threshold: 2000, color: '#2a9d8f'},
            {name: 'Enies Lobby', threshold: 3000, color: '#e76f51'},
            {name: 'Thriller Bark', threshold: 4000, color: '#6d597a'},
            {name: 'Sabaody', threshold: 5000, color: '#b56576'},
            {name: 'Marineford', threshold: 7500, color: '#e63946'},
            {name: 'Fish-Man Island', threshold: 10000, color: '#06d6a0'},
            {name: 'Dressrosa', threshold: 15000, color: '#bc6c25'},
            {name: 'Whole Cake Island', threshold: 20000, color: '#ff70a6'},
            {name: 'Wano', threshold: 25000, color: '#9b5de5'}
        ]
    };
    
    // Stats settings
    const STATS_CONFIG = {
        MAX_HISTORY_ENTRIES: 100,
        CHART_COLORS: {
            bar: {
                timed: 'rgba(177, 156, 217, 0.8)', // Lavender color
                word20: 'rgba(122, 172, 122, 0.8)', // Green for 20w
                word50: 'rgba(142, 192, 142, 0.8)', // Slightly lighter green for 50w
                word100: 'rgba(162, 212, 162, 0.8)', // Even lighter green for 100w
                word200: 'rgba(182, 232, 182, 0.8)', // Very light green for 200w
                word500: 'rgba(202, 252, 202, 0.8)', // Almost white-green for 500w
                word1000: 'rgba(222, 255, 222, 0.8)', // White-green for 1000w
                zoro: 'rgba(142, 142, 242, 0.8)' // Blue for zoro mode
            },
            line: {
                timed: 'rgba(177, 156, 217, 1)', // Solid lavender color
                word20: 'rgba(122, 172, 122, 1)', // Solid green for 20w
                word50: 'rgba(142, 192, 142, 1)', // Slightly lighter green for 50w
                word100: 'rgba(162, 212, 162, 1)', // Even lighter green for 100w
                word200: 'rgba(182, 232, 182, 1)', // Very light green for 200w
                word500: 'rgba(202, 252, 202, 1)', // Almost white-green for 500w
                word1000: 'rgba(222, 255, 222, 1)', // White-green for 1000w
                zoro: 'rgba(142, 142, 242, 1)' // Blue for zoro mode
            }
        }
    };
    
    // Storage keys
    const STORAGE_KEYS = {
        HISTORY: 'typesmash_history',
        ZORO_HISTORY: 'typesmash_zoro_history',
        SETTINGS: 'typesmash_settings',
        DARK_MODE: 'dark-mode'
    };
    
    // Easter egg configuration
    const EASTER_EGGS = {
        WPM_THRESHOLDS: {
            LOW_WPM: 20,    // Luffy laugh triggered below this WPM
            GOOD_WPM: 100,  // Good performance threshold
            GREAT_WPM: 150, // Excellent performance threshold
            NICE_WPM: 69,   // Special nice sound threshold
            SUS_WPM: 200    // Suspicious performance threshold
        },
        ANIMATION_DURATIONS: {
            LUFFY_LAUGH: 8000, // 8 seconds for Luffy laugh
            NAMI_EFFECT: 4000, // 4 seconds for Nami effect
            GOMU_EFFECT: 5000  // 5 seconds for Gomu effect
        }
    };
    
    // Public API
    return {
        APP: {
            NAME: APP_NAME,
            VERSION: APP_VERSION
        },
        TYPING: TYPING_CONFIG,
        ZORO: ZORO_CONFIG,
        STATS: STATS_CONFIG,
        STORAGE: STORAGE_KEYS,
        EASTER_EGGS: EASTER_EGGS
    };
})();

// Export for use in other modules
window.Config = Config;