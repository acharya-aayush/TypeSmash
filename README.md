# TypeSmash 💻⌨️

A minimalist typing test with detailed statistics, multiple test modes, and a surprise arcade game mode. Inspired by MonkeyType and One Piece.

![TypeSmash Logo](assets/mainlogo.png)

## 🚀 Features

### Standard Typing Test
- **15 Second Mode**: Race against the clock with a quick 15-second test
- **Word Modes**: Test your typing with different word counts (20, 50, 100, 200, 500, or 1000 words)
- **Meaningful Passages**: Read and type coherent text passages rather than random words
- **Keyboard Shortcuts**: Quick access to features with intuitive keyboard commands

### Advanced Statistics
- **WPM Tracking**: Track your Words Per Minute over time
- **Accuracy Metrics**: Monitor your typing precision with detailed accuracy stats
- **Visual History**: View your progress with bar and line charts
- **Filtering**: Filter statistics by test mode and word count
- **Improved Metrics**: Enhanced accuracy calculations and performance analytics
- **NEW**: Character-by-character heatmaps for error visualization

### User Experience
- **Dark Mode**: Eye-friendly dark theme for comfortable typing
- **Real-time Feedback**: Character-by-character verification as you type
- **Responsive Design**: Adapts to different screen sizes (best on desktop)
- **Custom Sounds**: Audio feedback for a satisfying typing experience
- **Help Menu**: Accessible keyboard shortcut guide via '?' key

## 🏗️ New Modular Architecture (v0.8.7)

TypeSmash has been completely refactored with a robust modular architecture for improved maintainability:

### Core Modules (Completed May 8, 2025)
- **config.js**: Central configuration management and constants
- **events.js**: Custom publish/subscribe event system for inter-module communication
- **state.js**: Centralized state management with reactive updates
- **app.js**: Application initialization and module coordination

### Typing Engine Modules (In Progress)
- **typing-engine.js**: Core typing test mechanics
- **text-display.js**: Text rendering and visualization with virtual DOM techniques
- **input-handler.js**: Enhanced user input processing with keyboard normalization
- **test-timer.js**: Advanced timer management with improved pause/resume functionality
- **metrics.js**: Real-time performance calculation with detailed keystroke analysis
- **word-provider.js**: Word and passage source management

### Benefits
- Better separation of concerns
- Improved code organization
- Easier debugging and maintenance
- More extensible for future features
- Detailed unit testing for core modules

See the [refactor_Plan.md](refactor_Plan.md) for a complete overview of the modular architecture.

## 🎮 How to Use

### Basic Controls
1. **Choose a Mode**: Click "15s" for timed mode or "Words" for word count mode
2. **Start Typing**: Just start typing to begin the test
3. **View Stats**: See your results instantly when the test ends
4. **Restart**: Press Tab to quickly restart a test
5. **Help**: Press '?' to access the keyboard shortcut guide

### Word Count Selection
1. Click the "Words" button to select word mode
2. Choose from the dropdown: 20, 50, 100, 200, 500, or 1000 words
3. Start typing to begin with your selected word count

### Stats Navigation
- **Open Stats View**: Click the stats icon to manually open detailed statistics
- **Filter Stats**: Use filter buttons to view specific test types
- **Change View**: Switch between bar chart and line graph views
- **Clear History**: Remove all saved history if desired
- **Note**: Stats must be manually opened after each test (automatic display was removed due to event timing issues)

## 🎵 Audio System

The latest update includes significant improvements to the audio system:

- **Volume Balance**: Background music plays at 40% volume with sound effects at full volume
- **Audio Management**: Proper suspension of audio context when exiting game modes
- **Sound Preloading**: Improved loading with better error handling
- **Audio Feedback**: Enhanced sound effects for typing, power-ups, and game events
- **Memory Management**: Fixed audio context memory leaks in transitions

## ⚖️ Power-up Balancing

Power-ups in Zoro Mode have been rebalanced to improve gameplay:

- **Onigiri**: Now requires 5000 points (increased from 100)
- **Haki**: Now requires 1000 points (increased from 200)
- **Ashura**: Now requires 7500 points (increased from 350)
- **Visual Indicators**: Added cooldown indicators for all power-ups

These adjustments create a more challenging progression system and prevent power-up abuse.

## 🎮 Keyboard Shortcuts

| Key | Function |
|-----|----------|
| Tab | Restart current test |
| Esc | Cancel current test |
| ? | Open keyboard shortcut help menu |
| Space | Start/restart test |
| 1 | Activate Onigiri power-up (Zoro Mode) |
| 2 | Activate Haki power-up (Zoro Mode) |
| 3 | Activate Ashura power-up (Zoro Mode) |

## 🗡️ Oh, and there's Zoro Mode... (last minute addition)

![Zoro Mode](assets/zoromodelogo.png)

A completely unplanned feature added in the final days of development. Words fall from the top of the screen, and you type them before they hit the bottom. Inspired by One Piece, because why not.

### Difficulty Tiers in Zoro Mode:
- East Blue → Alabasta → Skypiea → Water 7 → Enies Lobby → and many more!
- Each tier increases word speed and difficulty
- Word length increases as you progress through levels
- Improved difficulty distribution in higher game levels

### Controls:
- Type the falling words to slash them
- Use power-ups by typing their names or pressing number keys:
  - "onigiri" or 1: Clear all words on screen (requires 5000 points)
  - "haki" or 2: Slow down words temporarily (requires 1000 points)
  - "ashura" or 3: Automatic word slashing for 5 seconds (requires 7500 points)

### Latest Improvements (v0.8.5):
- Optimized rendering performance for smoother animations
- Fixed audio context memory leak in transitions
- Added visual cooldown indicators for power-ups
- Fine-tuned word falling speeds in higher difficulty tiers
- Improved responsive design for medium-sized screens
- Enhanced keyboard command responsiveness

### 🎮 Hidden Easter Eggs

TypeSmash includes several hidden Easter eggs waiting to be discovered:

- **Performance-Based Surprises**: Achieve certain WPM or accuracy milestones to trigger special effects
- **Word-Based Secrets**: Type specific words related to One Piece for animations and sounds
- **Visual Celebrations**: Enjoy character animations and sound effects when you least expect them

Find them all by trying different words and achieving various typing milestones!

### 🚀 Roadmap

- **Dedicated Zoro Mode Stats**: Separate statistics tracking for arcade mode performance
- **Advanced Statistics**: Deeper insights into typing patterns and habits
- **Mobile Support**: Adapting the interface for tablet and mobile devices
- **Custom Text Mode**: Allowing users to paste their own text for practice
- **Additional Themes**: More visual customization options

## 🚀 Getting Started
### Local Installation
1. Clone this repository
2. Open `index.html` in your browser
3. Start typing!

## 🔧 Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses Canvas API for Zoro Mode animations
- LocalStorage for saving typing history
- Service worker for improved offline functionality
- No external dependencies or frameworks

## 🤝 Contributing

This is a personal project, but I'm open to contributions! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

## 👋 About Me

I'm Aayush Acharya, a CS student and web developer.
- GitHub: [github.com/acharya-aayush](https://github.com/acharya-aayush)
- Email: acharyaaayush2k4@gmail.com

---

*TypeSmash v0.8.7 - Hope you enjoy it! Let me know if you break any WPM records!*