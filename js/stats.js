// Stats Module - Handles history tracking and visualization

// Global variables for stats
const statsState = {
    history: [],
    zoroHistory: [],
    currentFilter: 'all', // 'all', 'timed', 'word', 'zoro'
    currentView: 'bar'    // 'bar', 'line'
};

// DOM Elements
const statsElements = {
    historyTable: document.getElementById('history-table'),
    wpmGraph: document.getElementById('wpm-graph'),
    statsSection: document.getElementById('stats-section'),
    filterButtons: {
        all: document.getElementById('filter-all'),
        timed: document.getElementById('filter-timed'),
        word: document.getElementById('filter-word'),
        zoro: document.getElementById('filter-zoro')
    },
    viewButtons: {
        bar: document.getElementById('view-bar'),
        line: document.getElementById('view-line')
    },
    clearHistoryBtn: document.getElementById('clear-history'),
    closeStatsBtn: document.getElementById('close-stats'),
    statsToggleBtn: document.getElementById('stats-toggle')
};

/**
 * Load stats history from localStorage
 */
function loadHistory() {
    // Load regular typing history
    const savedHistory = localStorage.getItem('typingHistory');
    if (savedHistory) {
        try {
            statsState.history = JSON.parse(savedHistory);
        } catch (e) {
            console.error('Error parsing history:', e);
            statsState.history = [];
        }
    }
    
    // Load Zoro mode history
    const savedZoroHistory = localStorage.getItem('zoroHistory');
    if (savedZoroHistory) {
        try {
            statsState.zoroHistory = JSON.parse(savedZoroHistory);
        } catch (e) {
            console.error('Error parsing Zoro history:', e);
            statsState.zoroHistory = [];
        }
    }
}

/**
 * Save a new test result to history
 * @param {number} wpm - Words per minute
 * @param {number} accuracy - Accuracy percentage
 * @param {string} mode - Test mode ('timed' or 'word')
 * @param {number} characters - Correct characters typed
 * @param {number} errors - Error count
 * @param {string} time - Time taken
 */
function saveToHistory(wpm, accuracy, mode, characters, errors, time) {
    const newEntry = {
        wpm,
        accuracy,
        mode,
        characters,
        errors,
        time,
        timestamp: Date.now()
    };
    
    // Add to beginning of array to show newest first
    statsState.history.unshift(newEntry);
    
    // Limit history to 100 entries
    if (statsState.history.length > 100) {
        statsState.history = statsState.history.slice(0, 100);
    }
    
    // Save to localStorage
    localStorage.setItem('typingHistory', JSON.stringify(statsState.history));
    
    // Update UI if stats section is visible
    if (!statsElements.statsSection.classList.contains('hidden')) {
        renderHistoryTable();
        renderWPMGraph();
    }
}

/**
 * Save a Zoro game result to history
 * @param {number} score - Total score
 * @param {number} level - Level reached
 * @param {number} maxCombo - Maximum combo achieved
 * @param {number} duration - Game duration in seconds
 */
function saveZoroGameToHistory(score, level, maxCombo, duration) {
    console.log("saveZoroGameToHistory called with:", { score, level, maxCombo, duration });
    
    const newEntry = {
        score,
        level,
        maxCombo,
        duration: `${duration}s`,
        timestamp: Date.now()
    };
    
    console.log("Creating new Zoro history entry:", newEntry);
    
    // Add to beginning of array to show newest first
    statsState.zoroHistory.unshift(newEntry);
    console.log("Current zoroHistory length:", statsState.zoroHistory.length);
    
    // Limit history to 100 entries
    if (statsState.zoroHistory.length > 100) {
        statsState.zoroHistory = statsState.zoroHistory.slice(0, 100);
    }
    
    // Save to localStorage
    try {
        const jsonData = JSON.stringify(statsState.zoroHistory);
        localStorage.setItem('zoroHistory', jsonData);
        console.log("Successfully saved zoroHistory to localStorage", jsonData.substring(0, 100) + "...");
    } catch (error) {
        console.error("Error saving zoroHistory to localStorage:", error);
    }
    
    // Update UI if stats section is visible
    if (statsElements.statsSection && !statsElements.statsSection.classList.contains('hidden')) {
        console.log("Stats section is visible, updating UI");
        renderHistoryTable();
        renderWPMGraph();
    }
}

/**
 * Render history table
 */
function renderHistoryTable() {
    // Clear existing table
    const tbody = statsElements.historyTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Filter data based on current filter
    const filteredData = filterHistory();
    
    // Create rows for each entry
    filteredData.slice(0, 10).forEach((entry) => {
        const row = document.createElement('tr');
        
        if (entry.mode) {
            // Regular typing test entry
            
            // Mode cell
            const modeCell = document.createElement('td');
            modeCell.textContent = entry.mode === 'timed' ? '15s' : '20w';
            row.appendChild(modeCell);
            
            // WPM cell
            const wpmCell = document.createElement('td');
            wpmCell.textContent = entry.wpm;
            row.appendChild(wpmCell);
            
            // Accuracy cell
            const accuracyCell = document.createElement('td');
            accuracyCell.textContent = `${entry.accuracy}%`;
            row.appendChild(accuracyCell);
            
            // Characters cell
            const charsCell = document.createElement('td');
            charsCell.textContent = entry.characters;
            row.appendChild(charsCell);
            
            // Errors cell
            const errorsCell = document.createElement('td');
            errorsCell.textContent = entry.errors;
            row.appendChild(errorsCell);
            
            // Time cell
            const timeCell = document.createElement('td');
            timeCell.textContent = entry.time;
            row.appendChild(timeCell);
            
            // Date cell
            const dateCell = document.createElement('td');
            dateCell.textContent = formatTimestamp(entry.timestamp);
            row.appendChild(dateCell);
        } else {
            // Zoro mode entry
            
            // Mode cell
            const modeCell = document.createElement('td');
            modeCell.textContent = 'Zoro';
            modeCell.classList.add('zoro-mode-cell');
            row.appendChild(modeCell);
            
            // Score cell (in WPM column)
            const scoreCell = document.createElement('td');
            scoreCell.textContent = entry.score;
            row.appendChild(scoreCell);
            
            // Level cell (in Accuracy column)
            const levelCell = document.createElement('td');
            levelCell.textContent = `Lv ${entry.level}`;
            row.appendChild(levelCell);
            
            // Max Combo cell (in Characters column)
            const comboCell = document.createElement('td');
            comboCell.textContent = entry.maxCombo;
            row.appendChild(comboCell);
            
            // Empty errors cell
            const emptyCell = document.createElement('td');
            emptyCell.textContent = '-';
            row.appendChild(emptyCell);
            
            // Duration cell
            const durationCell = document.createElement('td');
            durationCell.textContent = entry.duration;
            row.appendChild(durationCell);
            
            // Date cell
            const dateCell = document.createElement('td');
            dateCell.textContent = formatTimestamp(entry.timestamp);
            row.appendChild(dateCell);
        }
        
        tbody.appendChild(row);
    });
    
    // Show message if no data
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = 'No history available';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tbody.appendChild(row);
    }
}

/**
 * Filter history based on mode
 * @returns {Array} Filtered data
 */
function filterHistory() {
    // Combine regular and zoro history based on filter
    let filteredData = [];
    
    if (statsState.currentFilter === 'all') {
        // Combine and sort all data by timestamp
        filteredData = [...statsState.history, ...statsState.zoroHistory];
        filteredData.sort((a, b) => b.timestamp - a.timestamp);
    } else if (statsState.currentFilter === 'zoro') {
        // Only zoro data
        filteredData = [...statsState.zoroHistory];
    } else {
        // Filter regular typing history by mode
        filteredData = statsState.history.filter(entry => entry.mode === statsState.currentFilter);
    }
    
    return filteredData;
}

/**
 * Render WPM graph or Zoro scores using canvas
 */
function renderWPMGraph() {
    const canvas = statsElements.wpmGraph;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Filter data
    const filteredData = filterHistory().slice(0, 10).reverse();
    
    if (filteredData.length === 0) {
        // Draw "No data" message
        ctx.fillStyle = '#646669';
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Determine what type of data to show
    const isZoroData = statsState.currentFilter === 'zoro';
    
    // Find max value for scaling
    let maxValue;
    if (isZoroData) {
        maxValue = Math.max(...filteredData.map(entry => entry.score));
    } else {
        maxValue = Math.max(...filteredData.map(entry => entry.wpm));
    }
    
    const scaleFactor = (canvas.height - 60) / (maxValue || 100);
    
    // Define colors
    const barColor = '#b19cd9'; // Changed from #e2b714 to lavender
    const zoroColor = '#a88bfa'; // Lavender color for Zoro mode
    const lineColor = '#7aac7a';
    const textColor = '#646669';
    const gridColor = '#323437';
    
    // Draw grid lines
    const gridCount = 5;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridCount; i++) {
        const y = canvas.height - 30 - (i * (canvas.height - 60) / gridCount);
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
        
        // Draw value labels
        const value = Math.round(i * (maxValue / gridCount));
        ctx.fillStyle = textColor;
        ctx.font = '10px "Roboto Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(value, 25, y + 3);
    }
    
    // Calculate bar width and spacing
    const barWidth = Math.min(50, (canvas.width - 50) / filteredData.length - 10);
    const spacing = (canvas.width - 50 - (barWidth * filteredData.length)) / (filteredData.length + 1);
    
    if (statsState.currentView === 'bar') {
        // Draw bars
        filteredData.forEach((entry, index) => {
            const x = 40 + spacing + index * (barWidth + spacing);
            
            // Get value based on data type
            const value = isZoroData ? entry.score : entry.wpm;
            const barHeight = value * scaleFactor;
            const y = canvas.height - 30 - barHeight;
            
            // Draw bar with appropriate color
            ctx.fillStyle = isZoroData ? zoroColor : barColor;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw index number
            ctx.fillStyle = textColor;
            ctx.font = '10px "Roboto Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(index + 1, x + barWidth / 2, canvas.height - 15);
        });
    } else {
        // Draw line chart
        ctx.strokeStyle = isZoroData ? zoroColor : lineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        filteredData.forEach((entry, index) => {
            const x = 40 + spacing + index * (barWidth + spacing) + barWidth / 2;
            
            // Get value based on data type
            const value = isZoroData ? entry.score : entry.wpm;
            const y = canvas.height - 30 - (value * scaleFactor);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw index number
            ctx.fillStyle = textColor;
            ctx.font = '10px "Roboto Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(index + 1, x, canvas.height - 15);
        });
        
        ctx.stroke();
        
        // Draw points
        filteredData.forEach((entry, index) => {
            const x = 40 + spacing + index * (barWidth + spacing) + barWidth / 2;
            
            // Get value based on data type
            const value = isZoroData ? entry.score : entry.wpm;
            const y = canvas.height - 30 - (value * scaleFactor);
            
            ctx.fillStyle = isZoroData ? zoroColor : lineColor;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Draw labels
    ctx.fillStyle = textColor;
    ctx.font = '12px "Roboto Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Number', canvas.width / 2, canvas.height - 5);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(isZoroData ? 'Score' : 'WPM', 0, 0);
    ctx.restore();
}

/**
 * Clear history with confirmation
 */
function clearHistory() {
    const confirmed = confirm('Are you sure you want to clear your typing history?');
    if (confirmed) {
        statsState.history = [];
        statsState.zoroHistory = [];
        
        localStorage.removeItem('typingHistory');
        localStorage.removeItem('zoroHistory');
        
        renderHistoryTable();
        renderWPMGraph();
    }
}

/**
 * Toggle stats section visibility
 */
function toggleStats() {
    const isHidden = statsElements.statsSection.classList.contains('hidden');
    
    if (isHidden) {
        // Show stats
        statsElements.statsSection.classList.remove('hidden');
        
        // Load history and render table/graph
        loadHistory();
        renderHistoryTable();
        renderWPMGraph();
    } else {
        // Hide stats
        statsElements.statsSection.classList.add('hidden');
    }
}

/**
 * Set filter for history display
 * @param {string} filter - Filter to apply ('all', 'timed', 'word', or 'zoro')
 */
function setFilter(filter) {
    statsState.currentFilter = filter;
    
    // Update active button
    for (const key in statsElements.filterButtons) {
        if (statsElements.filterButtons[key]) {
            statsElements.filterButtons[key].classList.toggle('active', key === filter);
        }
    }
    
    // Re-render table and graph
    renderHistoryTable();
    renderWPMGraph();
}

/**
 * Set view type for graph
 * @param {string} view - View type ('bar' or 'line')
 */
function setView(view) {
    statsState.currentView = view;
    
    // Update active button
    for (const key in statsElements.viewButtons) {
        if (statsElements.viewButtons[key]) {
            statsElements.viewButtons[key].classList.toggle('active', key === view);
        }
    }
    
    // Re-render graph
    renderWPMGraph();
}

/**
 * Initialize stats module
 */
function initStats() {
    console.log("Initializing stats module...");
    
    // Make sure we have all the DOM elements
    statsElements.historyTable = document.getElementById('history-table');
    statsElements.wpmGraph = document.getElementById('wpm-graph');
    statsElements.statsSection = document.getElementById('stats-section');
    statsElements.clearHistoryBtn = document.getElementById('clear-history');
    statsElements.closeStatsBtn = document.getElementById('close-stats');
    statsElements.statsToggleBtn = document.getElementById('stats-toggle');
    
    // Reinitialize filter buttons
    statsElements.filterButtons = {
        all: document.getElementById('filter-all'),
        timed: document.getElementById('filter-timed'),
        word: document.getElementById('filter-word'),
        zoro: document.getElementById('filter-zoro')
    };
    
    statsElements.viewButtons = {
        bar: document.getElementById('view-bar'),
        line: document.getElementById('view-line')
    };
    
    // Add Zoro filter button if it doesn't exist
    if (!statsElements.filterButtons.zoro) {
        console.log("Creating Zoro filter button...");
        const filtersContainer = document.querySelector('.filter-group');
        if (filtersContainer) {
            const zoroBtn = document.createElement('button');
            zoroBtn.id = 'filter-zoro';
            zoroBtn.className = 'filter-btn';
            zoroBtn.textContent = 'Zoro';
            filtersContainer.appendChild(zoroBtn);
            
            // Add to elements
            statsElements.filterButtons.zoro = zoroBtn;
        }
    }
    
    // Always reattach event listeners to ensure they work
    if (statsElements.filterButtons.zoro) {
        console.log("Attaching click handler to Zoro button");
        statsElements.filterButtons.zoro.addEventListener('click', function() {
            console.log("Zoro filter clicked");
            setFilter('zoro');
        });
    } else {
        console.error("Zoro filter button not found or created");
    }
    
    // Initialize events
    if (statsElements.statsToggleBtn) {
        statsElements.statsToggleBtn.addEventListener('click', toggleStats);
    }
    
    if (statsElements.closeStatsBtn) {
        statsElements.closeStatsBtn.addEventListener('click', () => {
            statsElements.statsSection.classList.add('hidden');
        });
    }
    
    if (statsElements.clearHistoryBtn) {
        statsElements.clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // Filter button events
    if (statsElements.filterButtons.all) {
        statsElements.filterButtons.all.addEventListener('click', () => {
            setFilter('all');
        });
    }
    
    if (statsElements.filterButtons.timed) {
        statsElements.filterButtons.timed.addEventListener('click', () => {
            setFilter('timed');
        });
    }
    
    if (statsElements.filterButtons.word) {
        statsElements.filterButtons.word.addEventListener('click', () => {
            setFilter('word');
        });
    }
    
    // View button events
    if (statsElements.viewButtons.bar) {
        statsElements.viewButtons.bar.addEventListener('click', () => {
            setView('bar');
        });
    }
    
    if (statsElements.viewButtons.line) {
        statsElements.viewButtons.line.addEventListener('click', () => {
            setView('line');
        });
    }
    
    // Load history
    loadHistory();
    
    // Handle window resize for responsive graph
    window.addEventListener('resize', () => {
        if (!statsElements.statsSection.classList.contains('hidden')) {
            renderWPMGraph();
        }
    });
}

// Export stats module as global
window.statsModule = {
    init: initStats,
    saveToHistory,
    saveZoroGameToHistory,
    toggleStats,
    loadHistory,
    updateStats: function(filter, view) {
        if (filter) setFilter(filter);
        if (view) setView(view);
        renderHistoryTable();
        renderWPMGraph();
    },
    clearHistory
};
