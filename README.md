# TypeSmash 💻⌨️

A minimalist typing test with detailed statistics, multiple test modes, and a surprise arcade game mode. Inspired by MonkeyType and One Piece.

![TypeSmash Logo](assets/mainlogo.png)

## 🚀 Features

### Standard Typing Test
- **15 Second Mode**: Race against the clock with a quick 15-second test
- **Word Modes**: Test your typing with different word counts (20, 50, 100, 200, 500, or 1000 words)
- **Meaningful Passages**: Read and type coherent text passages rather than random words

### Advanced Statistics
- **WPM Tracking**: Track your Words Per Minute over time
- **Accuracy Metrics**: Monitor your typing precision with detailed accuracy stats
- **Visual History**: View your progress with bar and line charts
- **Filtering**: Filter statistics by test mode and word count

### User Experience
- **Dark Mode**: Eye-friendly dark theme for comfortable typing
- **Real-time Feedback**: Character-by-character verification as you type
- **Responsive Design**: Adapts to different screen sizes (best on desktop)
- **Custom Sounds**: Audio feedback for a satisfying typing experience

## 🎮 How to Use

### Basic Controls
1. **Choose a Mode**: Click "15s" for timed mode or "Words" for word count mode
2. **Start Typing**: Just start typing to begin the test
3. **View Stats**: See your results instantly when the test ends
4. **Restart**: Press Tab to quickly restart a test

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

## ⚖️ Power-up Balancing

The recent update rebalanced power-ups in Zoro Mode to improve gameplay:

- **Onigiri**: Now requires 5000 points (increased from 100)
- **Haki**: Now requires 1000 points (increased from 200)
- **Ashura**: Now requires 7500 points (increased from 350)

These adjustments create a more challenging progression system and prevent power-up abuse.

## 🗡️ Oh, and there's Zoro Mode... (last minute addition)

![Zoro Mode](assets/zoromodelogo.png)

A completely unplanned feature added in the final days of development. Words fall from the top of the screen, and you type them before they hit the bottom. Inspired by One Piece, because why not.

### Difficulty Tiers in Zoro Mode:
- East Blue → Alabasta → Skypiea → Water 7 → Enies Lobby → and many more!
- Each tier increases word speed and difficulty
- Word length increases as you progress through levels

### Controls:
- Type the falling words to slash them
- Use power-ups by typing their names or pressing number keys:
  - "onigiri" or 1: Clear all words on screen (requires 5000 points)
  - "haki" or 2: Slow down words temporarily (requires 1000 points)
  - "ashura" or 3: Automatic word slashing for 5 seconds (requires 7500 points)

### Recent Fixes (v0.8.0):
- Fixed audio issues with the zorobattletheme sound not playing
- Increased background music volume to 40% for better audibility
- Implemented proper audio gain management for all sound effects
- Added proper audio context suspension when exiting Zoro mode
- Rebalanced power-up thresholds for better gameplay progression

### Upcoming Improvements (v0.8.1):
- Power-up cooldown system to prevent spamming
- Better balancing for speed and difficulty in higher levels
- Dedicated stats section for Zoro mode with metrics for:
  - Highest combo achieved
  - Total score
  - Words destroyed count
  - Power-ups used
  - Highest level reached
- Visual indicators for power-up cooldowns
- Proper separation of Zoro mode stats from regular typing test data

## 🚀 Getting Started

### Online Version
Visit [typesmash.netlify.app](https://typesmash.netlify.app) to use TypeSmash online.

### Local Installation
1. Clone this repository
2. Open `index.html` in your browser
3. Start typing!

## 🔧 Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses Canvas API for Zoro Mode animations
- LocalStorage for saving typing history
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

*Hope you enjoy TypeSmash! Let me know if you break any WPM records!*