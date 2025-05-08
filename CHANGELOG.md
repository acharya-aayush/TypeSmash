# TypeSmash Changelog

## v0.8.1 - 2025-05-08 (Easter Eggs Update)

- **feat**: Added "Nice" Easter egg when achieving exactly 69 WPM or 69% accuracy
- **feat**: Added Gomu Gomu Easter egg triggered by typing "gomu" or "gomugomu"
- **feat**: Added Nami-swan Easter egg triggered by typing "nami" or "namiswan"
- **feat**: Added Luffy laugh Easter egg that plays when typing less than 20 WPM
- **feat**: Added WPM milestone Easter eggs for high performance (100+ WPM, 150+ WPM)
- **feat**: Added perfect accuracy Easter egg for 100% accuracy tests
- **feat**: Added suspicious speed Easter egg for extremely high WPM with perfect accuracy
- **enhance**: Improved notification system for displaying Easter egg messages
- **ui**: Added visual effects for Easter eggs using One Piece character animations
- **refactor**: Preparation for upcoming code restructuring to split large files into smaller modules

## v0.8.0 - 2025-05-08 (Audio Fixes & Power-ups Update)

- **audio**: Fixed zorobattletheme.mp3 not playing in Zoro mode
- **audio**: Increased zorobattletheme volume from 20% to 40% for better audibility
- **audio**: Implemented proper audio gain management for all sound effects
- **fix**: Added proper audio context suspension when exiting Zoro mode
- **enhance**: Improved sound preloading with better error handling
- **balance**: Rebalanced power-up thresholds in Zoro mode:
  - Onigiri: 5000 points (was previously 100)
  - Haki: 1000 points (was previously 200)
  - Ashura: 7500 points (was previously 350)
- **feat**: Implemented meaningful passages in word mode
- **feat**: Added `getRandomPassage` function in utils.js
- **fix**: Fixed critical bug where word mode wasn't loading properly
- **enhance**: Improved error handling and debugging for word loading functionality
- **ui**: Removed automatic stats display due to event timing conflicts with DOM rendering
- **fix**: Stats section now requires manual opening via the stats toggle button

## v0.7.0 - 2025-05-07 (Meaningful Passages)

- **feat**: Added JSON-based passage collection for more engaging typing content
- **feat**: Implemented word mode variants (20w, 50w, 100w, 200w, 500w, 1000w)
- **enhance**: Added passage selection system for coherent typing experiences
- **ui**: Created word count dropdown for selecting different test lengths
- **stats**: Enhanced statistics to track different word count categories

## v0.6.1 - 2025-05-07 (Bug Fix)

- **fix**: Fixed critical "Play Again" functionality in arcade mode
- **fix**: Properly reset game state flag in restartZoroGame function
- **fix**: Ensured proper state management between multiple gameplay sessions

## v0.6.0 - 2025-05-06 (QA & Documentation)

- **fix**: Resolved statistics display bug in history view
- **fix**: Fixed event listener implementation on filter button
- **docs**: Created README and comprehensive documentation
- **refactor**: Optimized arcade mode performance
- **fix**: Resolved UI update bug in power-up display system
- **chore**: Removed debug console logs
- **release**: Finalized v1.0 with both standard typing test and arcade mode

## [PLANNED] v0.8.1 - 2025-05-20 (Zoro Mode Balancing)

- **fix**: Prevent power-up spamming by implementing cooldown periods
- **balance**: Adjust word falling speed in higher difficulty tiers (Marineford and above)
- **ui**: Add visual cooldown indicators for power-ups
- **enhance**: Balance word difficulty progression as player advances through tiers
- **fix**: Implement proper power-up state management to prevent abuse
- **balance**: Fine-tune Ashura and Onigiri power-ups for better gameplay experience
- **ui**: Create separate statistics section specifically for Zoro mode
- **stats**: Add dedicated metrics for Zoro mode (combo, score, words destroyed, power-ups used)
- **fix**: Prevent stats confusion between WPM and Zoro mode score
- **enhance**: Separate Zoro mode statistics from "All" section to prevent data corruption

## v0.9.0 - 2025-05-30 (HTTPS Server Implementation)

- **feat**: Add HTTPS Python server for secure local development
- **security**: Implement SSL certificate generation for local testing
- **docs**: Document server setup and usage instructions
- **config**: Add configuration options for server port and SSL settings

## v0.7.0 - 2025-05-07 (Expanded Word Modes)

- **feat**: Expanded word mode to include 20, 50, 100, 200, 500, and 1000 word counts
- **data**: Added words_collection.json with meaningful text passages for each word count
- **ui**: Implemented dropdown menu for selecting word count options
- **feat**: Enhanced stats tracking to display different word modes separately
- **fix**: Improved word mode visualization in stats graphs with color coding
- **style**: Updated filter buttons in stats view for all word count options
- **docs**: Updated documentation to reflect the expanded word modes

## v0.6.1 - 2025-05-07 (Bug Fix)

- **fix**: Fixed critical "Play Again" functionality in arcade mode
- **fix**: Properly reset game state flag in restartZoroGame function
- **fix**: Ensured proper state management between multiple gameplay sessions

## v0.6.0 - 2025-05-06 (QA & Documentation)

- **fix**: Resolved statistics display bug in history view
- **fix**: Fixed event listener implementation on filter button
- **docs**: Created README and comprehensive documentation
- **refactor**: Optimized arcade mode performance
- **fix**: Resolved UI update bug in power-up display system
- **chore**: Removed debug console logs
- **release**: Finalized v1.0 with both standard typing test and arcade mode

## v0.5.0 - 2025-05-05 (Arcade Mode Enhancement)

- **feat**: Added difficulty progression system with 4 tiers
- **feat**: Implemented power-up system with three unique abilities:
  - Health restoration
  - Temporary invincibility
  - Screen clearing functionality
- **ui**: Created game over screen with score, level and combo stats
- **data**: Added tiered word lists in zorotypinggamewords.json

## v0.4.0 - 2025-05-04 (Scope Adjustment & Arcade Mode)

- **breaking**: Removed 30s, 60s time modes to simplify core experience
- **refactor**: Retained only 15s timed and 20 word count modes
- **deprecated**: Discontinued Code Mode due to technical limitations
- **feat**: Conceptualized game-based typing mode with falling words
- **wip**: Implemented canvas-based animation system for arcade mode
- **feat**: Added word falling mechanics and user interaction system

## v0.3.0 - 2025-05-03 (UI Improvements & Code Mode Prototype)

- **wip**: Started implementing Code Mode for programming language practice
- **fix**: Addressed issues with syntax highlighting in Code Mode
- **debug**: Troubleshooting tab key behavior and indentation handling
- **style**: Refined UI with improved styling and dark theme implementation
- **ui**: Applied custom visual elements while maintaining minimalist aesthetic

## v0.2.0 - 2025-05-02 (Core Functionality)

- **feat**: Extended test options with additional time modes (30s, 60s)
- **feat**: Added word count modes (10, 20, 50, 100 words)
- **feat**: Implemented statistics tracking (WPM, accuracy, char count)
- **feat**: Added keyboard sound feedback for enhanced UX
- **feat**: Integrated localStorage for persistent stats storage

## v0.1.0 - 2025-05-01 (Project Initiation)

- **feat**: Initial project structure and repository setup
- **refactor**: Renamed project from "SpeedTyper" to "TypeTest" to final name "TypeSmash"
- **feat**: Implemented core typing test functionality with 15-second timer mode
- **feat**: Added character-by-character verification system for typing accuracy

---

*TypeSmash v0.7.0 - Developed by Aayush Acharya*