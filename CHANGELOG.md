# TypeSmash Changelog

## v0.1.0 - 2025-05-01 (Project Initiation)

- **feat**: Initial project structure and repository setup
- **refactor**: Renamed project from "SpeedTyper" to "TypeTest" to final name "TypeSmash"
- **feat**: Implemented core typing test functionality with 15-second timer mode
- **feat**: Added character-by-character verification system for typing accuracy

## v0.2.0 - 2025-05-02 (Core Functionality)

- **feat**: Extended test options with additional time modes (30s, 60s)
- **feat**: Added word count modes (10, 20, 50, 100 words)
- **feat**: Implemented statistics tracking (WPM, accuracy, char count)
- **feat**: Added keyboard sound feedback for enhanced UX
- **feat**: Integrated localStorage for persistent stats storage

## v0.3.0 - 2025-05-03 (UI Improvements & Code Mode Prototype)

- **wip**: Started implementing Code Mode for programming language practice
- **fix**: Addressed issues with syntax highlighting in Code Mode
- **debug**: Troubleshooting tab key behavior and indentation handling
- **style**: Refined UI with improved styling and dark theme implementation
- **ui**: Applied custom visual elements while maintaining minimalist aesthetic

## v0.4.0 - 2025-05-04 (Scope Adjustment & Arcade Mode)

- **breaking**: Removed 30s, 60s time modes to simplify core experience
- **refactor**: Retained only 15s timed and 20 word count modes
- **deprecated**: Discontinued Code Mode due to technical limitations
- **feat**: Conceptualized game-based typing mode with falling words
- **wip**: Implemented canvas-based animation system for arcade mode
- **feat**: Added word falling mechanics and user interaction system

## v0.5.0 - 2025-05-05 (Arcade Mode Enhancement)

- **feat**: Added difficulty progression system with 4 tiers
- **feat**: Implemented power-up system with three unique abilities:
  - Health restoration
  - Temporary invincibility
  - Screen clearing functionality
- **ui**: Created game over screen with score, level and combo stats
- **data**: Added tiered word lists in zorotypinggamewords.json

## v0.6.0 - 2025-05-06 (QA & Documentation)

- **fix**: Resolved statistics display bug in history view
- **fix**: Fixed event listener implementation on filter button
- **docs**: Created README and comprehensive documentation
- **refactor**: Optimized arcade mode performance
- **fix**: Resolved UI update bug in power-up display system
- **chore**: Removed debug console logs
- **release**: Finalized v1.0 with both standard typing test and arcade mode

## v0.6.1 - 2025-05-07 (Bug Fix)

- **fix**: Fixed critical "Play Again" functionality in arcade mode
- **fix**: Properly reset game state flag in restartZoroGame function
- **fix**: Ensured proper state management between multiple gameplay sessions

---

*TypeSmash v0.6.1 - Developed by Aayush Acharya*