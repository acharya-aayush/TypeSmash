/**
 * Stats.js - Manages typing statistics and history
 */

// Stats configuration
const statsConfig = {
    maxHistoryEntries: 100,
    chartColors: {
        bar: {
            timed: 'rgba(177, 156, 217, 0.8)', // Lavender color
            word20: 'rgba(122, 172, 122, 0.8)', // Green for 20w
            word50: 'rgba(142, 192, 142, 0.8)', // Slightly lighter green for 50w
            word100: 'rgba(162, 212, 162, 0.8)', // Even lighter green for 100w
            word200: 'rgba(182, 232, 182, 0.8)', // Very light green for 200w
            word500: 'rgba(202, 252, 202, 0.8)', // Almost white-green for 500w
            word1000: 'rgba(222, 255, 222, 0.8)', // Nearly white green for 1000w
            zoro: 'rgba(168, 139, 250, 0.8)' // Purple for Zoro mode
        },
        line: {
            timed: 'rgb(177, 156, 217)', // Solid lavender
            word20: 'rgb(122, 172, 122)', // Solid green for 20w
            word50: 'rgb(142, 192, 142)', // Slightly lighter solid green for 50w
            word100: 'rgb(162, 212, 162)', // Even lighter solid green for 100w
            word200: 'rgb(182, 232, 182)', // Very light solid green for 200w
            word500: 'rgb(202, 252, 202)', // Almost white-green solid for 500w
            word1000: 'rgb(222, 255, 222)', // Nearly white green solid for 1000w
            zoro: 'rgb(168, 139, 250)' // Solid purple for Zoro mode
        }
    }
};

// Local storage keys
const HISTORY_KEY = 'typingHistory';
const SETTINGS_KEY = 'typingSettings';

// Stats data
let typingHistory = [];
let typingSettings = {
    soundEnabled: true,
    theme: 'dark',
    keyboardLayout: 'qwerty'
};

// Chart instance
let wpmChart = null;

/**
 * Initialize stats module
 */
function init() {
    // Load history from local storage
    loadHistory();
    
    // Load settings from local storage
    loadSettings();
    
    // Initialize chart
    initChart('bar');
}

/**
 * Load typing history from local storage
 */
function loadHistory() {
    try {
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
            typingHistory = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('Failed to load typing history:', error);
        typingHistory = [];
    }
}

/**
 * Save typing history to local storage
 */
function saveHistory() {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(typingHistory));
    } catch (error) {
        console.error('Failed to save typing history:', error);
    }
}

/**
 * Load user settings from local storage
 */
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            typingSettings = { ...typingSettings, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

/**
 * Save user settings to local storage
 */
function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(typingSettings));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

/**
 * Save a test result to history
 * @param {number} wpm - Words per minute
 * @param {number} accuracy - Accuracy percentage
 * @param {string} mode - Test mode ('timed' or 'word-XX' or 'zoro')
 * @param {number} chars - Characters typed
 * @param {number} errors - Error count
 * @param {string} time - Time display string
 * @param {number} actualWordCount - Actual number of words (for word mode)
 */
function saveToHistory(wpm, accuracy, mode, chars, errors, time, actualWordCount = null) {
    // Create new history entry
    const newEntry = {
        wpm,
        accuracy,
        mode,
        chars,
        errors,
        time,
        timestamp: Date.now(),
        actualWordCount: actualWordCount  // Store actual word count if provided
    };
    
    // Add to beginning of array
    typingHistory.unshift(newEntry);
    
    // Limit history size
    if (typingHistory.length > statsConfig.maxHistoryEntries) {
        typingHistory = typingHistory.slice(0, statsConfig.maxHistoryEntries);
    }
    
    // Save to local storage
    saveHistory();
    
    // Update stats display
    updateStats();
}

/**
 * Clear typing history (with confirmation)
 */
function clearHistory() {
    // Reset history
    typingHistory = [];
    
    // Save empty history to local storage
    saveHistory();
    
    // Update stats display
    updateStats();
}

/**
 * Format a mode identifier for display
 * @param {string} mode - Mode identifier ('timed', 'word-XX', or 'zoro')
 * @param {number} actualWordCount - Actual number of words (optional)
 * @returns {string} Formatted mode name
 */
function formatMode(mode, actualWordCount = null) {
    if (mode === 'timed') return '15s';
    if (mode === 'zoro') return 'Zoro';
    
    // Handle word modes like 'word-20', 'word-50', etc.
    if (mode.startsWith('word-')) {
        const wordCount = mode.split('-')[1];
        // Only show actual count if it differs from nominal count
        if (actualWordCount && actualWordCount !== parseInt(wordCount, 10)) {
            return `${wordCount}w (${actualWordCount})`;
        }
        return `${wordCount}w`;
    }
    
    return mode; // Fallback
}

/**
 * Initialize the WPM chart
 * @param {string} type - Chart type ('bar' or 'line')
 */
function initChart(type = 'bar') {
    const ctx = document.getElementById('wpm-graph').getContext('2d');
    
    if (wpmChart) {
        wpmChart.destroy();
    }
    
    // Default to showing the most recent 10 entries
    const chartData = prepareChartData(typingHistory.slice(0, 10), type);
    
    wpmChart = new Chart(ctx, {
        type: type,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'WPM'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Test Number'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const entry = typingHistory[context.dataIndex];
                            return [
                                `WPM: ${entry.wpm}`,
                                `Accuracy: ${entry.accuracy}%`,
                                `Mode: ${formatMode(entry.mode)}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

/**
 * Prepare data for the WPM chart
 * @param {Array} entries - History entries to chart
 * @param {string} chartType - Chart type ('bar' or 'line')
 * @returns {Object} Chart data configuration
 */
function prepareChartData(entries, chartType = 'bar') {
    const labels = entries.map((_, index) => `Test ${entries.length - index}`).reverse();
    const datasets = [];
    
    // Group entries by mode
    const modeGroups = {};
    
    entries.forEach((entry, index) => {
        // Determine the mode category
        let modeCategory = 'timed';
        if (entry.mode === 'zoro') {
            modeCategory = 'zoro';
        } else if (entry.mode.startsWith('word-')) {
            const wordCount = entry.mode.split('-')[1];
            modeCategory = `word${wordCount}`;
        }
        
        // Initialize the mode group if it doesn't exist
        if (!modeGroups[modeCategory]) {
            modeGroups[modeCategory] = {
                label: formatMode(entry.mode),
                data: Array(entries.length).fill(null),
                backgroundColor: statsConfig.chartColors[chartType][modeCategory] || 'rgba(150, 150, 150, 0.8)',
                borderColor: statsConfig.chartColors.line[modeCategory] || 'rgb(150, 150, 150)',
                borderWidth: chartType === 'line' ? 2 : 1,
                tension: chartType === 'line' ? 0.3 : 0, // Add tension for smooth lines
                fill: chartType !== 'line', // Only fill for bar charts
                pointRadius: chartType === 'line' ? 4 : 0, // Add points for line charts
                pointHoverRadius: chartType === 'line' ? 6 : 0
            };
        }
        
        // Add the WPM value to the appropriate position
        modeGroups[modeCategory].data[entries.length - 1 - index] = entry.wpm;
    });
    
    // Convert mode groups to datasets
    for (const key in modeGroups) {
        datasets.push(modeGroups[key]);
    }
    
    return { labels, datasets };
}

/**
 * Update the stats display
 * @param {string} filter - Filter type ('all', 'timed', 'word-XX', 'zoro')
 * @param {string} viewType - Chart view type ('bar', 'line')
 */
function updateStats(filter = 'all', viewType = null) {
    // Filter history based on filter type
    let filteredHistory = typingHistory;
    
    if (filter !== 'all') {
        filteredHistory = typingHistory.filter(entry => entry.mode === filter);
    }
    
    // Get chart type based on active view button
    if (!viewType) {
        const activeViewBtn = document.querySelector('.view-btn.active');
        viewType = activeViewBtn ? activeViewBtn.id.replace('view-', '') : 'bar';
    }
    
    // Update the chart
    if (filteredHistory.length > 0) {
        const chartData = prepareChartData(filteredHistory.slice(0, 10), viewType);
        updateChart(chartData, viewType);
    } else {
        // No data to display, show empty chart
        updateChart({ labels: [], datasets: [] }, viewType);
    }
    
    // Update the history table
    updateHistoryTable(filteredHistory);
}

/**
 * Update the WPM chart
 * @param {Object} chartData - Chart data configuration
 * @param {string} type - Chart type ('bar' or 'line')
 */
function updateChart(chartData, type = 'bar') {
    if (wpmChart) {
        wpmChart.destroy();
    }
    
    const ctx = document.getElementById('wpm-graph').getContext('2d');
    
    wpmChart = new Chart(ctx, {
        type: type,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'WPM'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Test Number'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value} WPM`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the history table
 * @param {Array} entries - History entries to display
 */
function updateHistoryTable(entries) {
    const tableBody = document.querySelector('#history-table tbody');
    tableBody.innerHTML = '';
    
    if (entries.length === 0) {
        // Show a message if there's no history
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.setAttribute('colspan', '7');
        emptyCell.textContent = 'No typing history available.';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '2rem 0';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add rows for each history entry
    entries.forEach(entry => {
        const row = document.createElement('tr');
        
        // Mode column with class for styling
        const modeCell = document.createElement('td');
        modeCell.textContent = formatMode(entry.mode, entry.actualWordCount);
        
        // Add actual word count as tooltip if available and different from nominal
        if (entry.actualWordCount && entry.mode.startsWith('word-')) {
            const nominalCount = parseInt(entry.mode.split('-')[1], 10);
            if (entry.actualWordCount !== nominalCount) {
                modeCell.setAttribute('title', `Actual: ${entry.actualWordCount} words`);
            }
        }
        
        if (entry.mode === 'zoro') {
            modeCell.classList.add('zoro-mode-cell');
        }
        row.appendChild(modeCell);
        
        // WPM column
        const wpmCell = document.createElement('td');
        wpmCell.textContent = entry.wpm;
        row.appendChild(wpmCell);
        
        // Accuracy column
        const accuracyCell = document.createElement('td');
        accuracyCell.textContent = `${entry.accuracy}%`;
        row.appendChild(accuracyCell);
        
        // Characters column
        const charsCell = document.createElement('td');
        charsCell.textContent = entry.chars;
        row.appendChild(charsCell);
        
        // Errors column
        const errorsCell = document.createElement('td');
        errorsCell.textContent = entry.errors;
        row.appendChild(errorsCell);
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = entry.time;
        row.appendChild(timeCell);
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = formatTimestamp(entry.timestamp);
        row.appendChild(dateCell);
        
        // Add the row to the table
        tableBody.appendChild(row);
    });
}

/**
 * Format a timestamp into a readable date string
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted date string
 */
function formatTimestamp(timestamp) {
    if (window.utilsModule && window.utilsModule.formatTimestamp) {
        return window.utilsModule.formatTimestamp(timestamp);
    }
    
    // Fallback if utils module is not available
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Export the stats module
window.statsModule = {
    init,
    saveToHistory,
    updateStats,
    clearHistory,
    getSettings: () => typingSettings,
    updateSettings: (newSettings) => {
        typingSettings = { ...typingSettings, ...newSettings };
        saveSettings();
    }
};
