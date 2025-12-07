# ScaleVerse 🌌

**ScaleVerse** is an interactive, browser-based multi-instrument scale and chord visualizer. It helps musicians understand music theory by visualizing scales, intervals, and chords across Guitar, Bass, Ukulele, Banjo, and Piano with high-quality audio playback.

![Fretboard Preview](./fretboard_preview.png)
*(Note: Add a screenshot here relative to your repo)*

## ✨ Features

- **Interactive Fretboard**: Visualizes scales, notes, and intervals dynamically.
- **High-Quality Audio**: Custom-built **Dual Oscillator Synthesis** engine with pick attack noise for realistic guitar tone.
- **Extended Range Support**: Fully supports **7-String** and **8-String** guitars.
- **Drone Mode**: Play a continuous background reference tone (Root Note) to practice modes and intonation.
- **Chord Highlighting**: Select chords to see how they fit within the scale (Triads & 7ths).
- **Custom Tunings**: Support for Standard, Drop D, DADGAD, Open G, and more.
- **Save as Image**: Export your current fretboard view as a high-resolution PNG.
- **100% Client-Side**: No backend required. Runs entirely in the browser using modern HTML5, CSS3, and JavaScript (Web Audio API).

## 🚀 How to Use

### Running Locally
Since this is a static application, you can simply:
1.  **Double-click** `index.html` to open it in your browser.
2.  *Optional*: For a better experience (to avoid CORS issues with some local file assets if you add proper icons later), run a simple local server:
    ```bash
    npx serve .
    ```

### Controls
- **Root & Scale**: Choose your key (e.g., C Major, A Minor Pentatonic).
- **Show As**: Toggle between Note Names (C, D, E) and Intervals (R, M3, P5).
- **Drone 🔊**: Toggle the bass drone note on/off.
- **Settings ⚙️**: Select your **Instrument** and **Tuning**:
    - **Guitar**: 6, 7, 8 String
    - **Bass**: 4, 5, 6 String
    - **Ukulele**: High G, Low G
    - **Banjo**: Open G
    - **Violin**: Standard (G D A E)
    - **Piano**: 88, 61, or 49 Keys (Keyboard Visualization)
- **Save Image 📷**: Download the current visualization.


## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Variables, Flexbox/Grid).
- **Logic**: Vanilla JavaScript (ES6+).
- **Audio**: Web Audio API (Oscillators, Filters, Gain Nodes).
- **Dependencies**: 
    - `html2canvas` (for image export).
    - Google Fonts (Outfit).

## 📄 License

This project is open-source and available under the **MIT License**. Feel free to fork, modify, and improve it!
