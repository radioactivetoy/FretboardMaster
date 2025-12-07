document.addEventListener('DOMContentLoaded', () => {
    const rootSelect = document.getElementById('root-select');
    const instrumentSelect = document.getElementById('instrument-select');
    const tuningSelect = document.getElementById('tuning-select');
    const scaleSelect = document.getElementById('scale-select');
    const displayModeSelect = document.getElementById('display-mode');
    const chordSelect = document.getElementById('chord-select');
    const complexitySelect = document.getElementById('chord-complexity');
    const fretboard = document.getElementById('fretboard');
    const scaleNameElement = document.getElementById('current-scale-name');
    const chordNameElement = document.getElementById('selected-chord-name');
    const scaleNotesElement = document.getElementById('scale-notes');

    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Populate Root Selector
    chromaticScale.forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        rootSelect.appendChild(option);
    });

    // Populate Instrument Selector
    const instruments = Object.keys(MusicTheory.INSTRUMENTS);
    instruments.forEach(inst => {
        const option = document.createElement('option');
        option.value = inst;
        option.textContent = inst;
        instrumentSelect.appendChild(option);
    });

    function updateTunings() {
        const instrument = instrumentSelect.value;
        const availableTunings = MusicTheory.INSTRUMENTS[instrument];

        tuningSelect.innerHTML = '';
        availableTunings.forEach(tuning => {
            const option = document.createElement('option');
            option.value = tuning;
            option.textContent = tuning;
            tuningSelect.appendChild(option);
        });

        // Trigger update to set defaults
        updateScale();
    }

    instrumentSelect.addEventListener('change', updateTunings);

    let currentScaleData = null;
    let currentTuningMidi = [40, 45, 50, 55, 59, 64]; // Default Standard

    async function updateScale() {
        const root = rootSelect.value;
        const type = scaleSelect.value;
        const complexity = complexitySelect ? complexitySelect.value : 'triad';
        const tuning = tuningSelect ? tuningSelect.value : 'Standard';

        try {
            // Local Client-Side Calculation
            const data = MusicTheory.getData(root, type, complexity, tuning);

            currentScaleData = data;
            if (data.tuning_midi) {
                currentTuningMidi = data.tuning_midi;
            }
            // Store for use in renderFretboard
            currentScaleData.characteristic_intervals = data.characteristic_intervals || [];

            // Update Fretboard Class for CSS styling (Bass strings vs Guitar etc)
            const instrument = instrumentSelect.value;
            fretboard.className = ''; // Reset
            if (instrument.toLowerCase().includes('bass')) {
                fretboard.classList.add('inst-bass');
            } else if (instrument.toLowerCase().includes('ukulele')) {
                fretboard.classList.add('inst-uke');
            } else if (instrument.toLowerCase().includes('banjo')) {
                fretboard.classList.add('inst-banjo');
            } else if (instrument.toLowerCase().includes('violin')) {
                fretboard.classList.add('inst-violin');
            } else {
                fretboard.classList.add('inst-guitar');
            }

            // Populate Chords Selector
            populateChords(data.chords);

            renderFretboard(data);
            updateInfo(data);
        } catch (error) {
            console.error('Error calculating scale:', error);
        }
    }

    function populateChords(chords) {
        // save current selection if possible, otherwise reset
        const currentSelection = chordSelect.value;

        // Clear existing options except first
        while (chordSelect.options.length > 1) {
            chordSelect.remove(1);
        }

        chords.forEach(chord => {
            const option = document.createElement('option');
            option.value = chord.notes.join(','); // Store notes like "C,E,G"
            option.textContent = `${chord.name} (Degree ${chord.degree})`;
            if (currentSelection === option.value) {
                option.selected = true;
            }
            chordSelect.appendChild(option);
        });

        // If we changed scale, chord options changed, reset to none usually
        if (!Array.from(chordSelect.options).some(o => o.value === currentSelection)) {
            chordSelect.value = 'none';
        }
    }

    // --- AUDIO ENGINE ---
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function getNoteFrequency(stringNum, fret) {
        // stringNum is 1-based (1=Low, 6=High)
        // currentTuningMidi index is 0-based
        const openMidi = currentTuningMidi[stringNum - 1];
        const midi = openMidi + fret;
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function playTone(freq) {
        initAudio();
        const t = audioCtx.currentTime;

        // Master Gain
        const masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.setValueAtTime(0.5, t); // Overall volume scaling

        // --- 1. String Body (Dual Oscillator Subtractive) ---
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const stringGain = audioCtx.createGain();

        // Osc 1: Fundamental
        osc1.type = 'sawtooth';
        osc1.frequency.value = freq;

        // Osc 2: Detuned (Chorus effect)
        osc2.type = 'sawtooth';
        osc2.frequency.value = freq;
        osc2.detune.value = 8; // +8 cents detune for thickness

        // Filter: Lowpass envelope for "pluck" tone
        filter.type = 'lowpass';
        filter.Q.value = 3; // Resonance for "wood" character
        filter.frequency.setValueAtTime(freq * 5, t); // Start bright
        filter.frequency.exponentialRampToValueAtTime(freq, t + 0.3); // Decay to fundamental

        // Gain Envelope: Sharp attack, long decay
        stringGain.gain.setValueAtTime(0, t);
        stringGain.gain.linearRampToValueAtTime(1, t + 0.02);
        stringGain.gain.exponentialRampToValueAtTime(0.01, t + 2.0);

        // Routing
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(stringGain);
        stringGain.connect(masterGain);

        osc1.start(t);
        osc1.stop(t + 2.0);
        osc2.start(t);
        osc2.stop(t + 2.0);

        // --- 2. Pick Attack (Noise Transients) ---
        const noiseBufferSize = audioCtx.sampleRate * 0.05; // 50ms buffer
        const buffer = audioCtx.createBuffer(1, noiseBufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        const noiseGain = audioCtx.createGain();

        // Filter noise to be high-frequency "click"
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        // Short Burst Envelope
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noise.start(t);
    }

    // --- DRONE ENGINE ---
    let droneOsc = null;
    let droneGain = null;
    let isDroneOn = false;
    const droneBtn = document.getElementById('drone-btn');

    function getRootFrequency(rootName) {
        // Find index of root note
        const index = chromaticScale.indexOf(rootName);
        if (index === -1) return 261.63; // Fallback Middle C

        // C4 is MIDI 60 (Middle C). 
        // 440Hz is A4 (MIDI 69).
        const midi = 60 + index;
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function toggleDrone() {
        if (isDroneOn) {
            // Stop Drone
            if (droneOsc) {
                const t = audioCtx.currentTime;
                droneGain.gain.exponentialRampToValueAtTime(0.001, t + 1); // Fade out
                droneOsc.stop(t + 1);
                droneOsc = null;
                droneGain = null;
            }
            isDroneOn = false;
            droneBtn.textContent = "Drone 🔇";
            droneBtn.classList.remove('active');
        } else {
            // Start Drone
            initAudio();
            const root = rootSelect.value;
            const freq = getRootFrequency(root);
            const t = audioCtx.currentTime;

            droneOsc = audioCtx.createOscillator();
            droneGain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            // Warm, steady tone
            droneOsc.type = 'triangle';
            droneOsc.frequency.setValueAtTime(freq, t);

            // Lowpass: Opened up to 800Hz so it's not just "mud"
            filter.type = 'lowpass';
            filter.frequency.value = 800;

            // Fade in: Lower volume (0.1) for background feel
            droneGain.gain.setValueAtTime(0, t);
            droneGain.gain.linearRampToValueAtTime(0.1, t + 1);

            droneOsc.connect(filter);
            filter.connect(droneGain);
            droneGain.connect(audioCtx.destination);

            droneOsc.start(t);

            isDroneOn = true;
            droneBtn.textContent = "Drone 🔊";
            droneBtn.classList.add('active');
        }
    }

    function updateDronePivot() {
        if (isDroneOn && droneOsc) {
            const root = rootSelect.value;
            const freq = getRootFrequency(root);
            const t = audioCtx.currentTime;
            droneOsc.frequency.setValueAtTime(freq, t);
        }
    }

    if (droneBtn) {
        droneBtn.addEventListener('click', toggleDrone);
    }


    function renderFretboard(data) {
        if (!data) return;
        fretboard.innerHTML = '';

        // Detect Instrument Type
        const instrument = instrumentSelect.value;
        const isPiano = instrument.includes('Piano');

        if (isPiano) {
            renderPiano(data, instrument, tuningSelect.value);
            return;
        }

        const mode = displayModeSelect ? displayModeSelect.value : 'notes';
        const chordSelection = chordSelect.value; // "none" or "Note1,Note2,Note3"
        const chordNotes = chordSelection === 'none' ? null : chordSelection.split(',');

        // Configuration
        const numFrets = 24;
        const fretWidth = 60; // px

        // Fret Numbers (0-24)
        for (let i = 0; i <= numFrets; i++) {
            const number = document.createElement('div');
            number.className = 'fret-number';
            number.textContent = i;
            number.style.left = `${(i * fretWidth) + 30}px`;
            fretboard.appendChild(number);
        }

        // Render Strings (High E top, Low E bottom)
        const stringsToRender = [...data.fretboard].reverse();

        stringsToRender.forEach((stringObj, i) => {
            const stringDiv = document.createElement('div');
            stringDiv.className = 'string';
            stringDiv.style.width = `${numFrets * fretWidth}px`;

            const notesMap = {};
            stringObj.notes.forEach(n => notesMap[n.fret] = n);

            for (let f = 0; f <= numFrets; f++) {
                const fretPos = f * fretWidth;

                // Drawing fret lines
                if (i === 0) {
                    if (f > 0) {
                        const actualLine = document.createElement('div');
                        actualLine.className = 'fret-line';
                        actualLine.style.left = `${fretPos}px`;
                        actualLine.style.height = `${stringsToRender.length * 40}px`;
                        fretboard.appendChild(actualLine);
                    }
                }

                if (notesMap[f]) {
                    const noteInfo = notesMap[f];

                    // Highlight Logic
                    let isHighlighted = false;

                    if (chordNotes) {
                        if (chordNotes.includes(noteInfo.note)) {
                            isHighlighted = true;
                        }
                    }

                    const noteMarker = document.createElement('div');
                    noteMarker.className = `note-marker ${getIntervalClass(noteInfo.interval)}`;

                    if (isHighlighted) {
                        noteMarker.classList.add('highlight-chord');
                        noteMarker.style.zIndex = '10';
                        noteMarker.style.transform = 'translate(-50%, -50%) scale(1.1)';

                        // Check if this chord note is also characteristic
                        if (data.characteristic_intervals && data.characteristic_intervals.includes(noteInfo.interval)) {
                            noteMarker.classList.add('characteristic');
                        }
                    } else {
                        if (!chordNotes && data.characteristic_intervals && data.characteristic_intervals.includes(noteInfo.interval)) {
                            noteMarker.classList.add('characteristic');
                        }
                    }

                    if (mode === 'intervals') {
                        noteMarker.textContent = noteInfo.interval;
                    } else {
                        noteMarker.textContent = noteInfo.note;
                    }

                    // Position
                    const leftPos = f === 0 ? -30 : (f * fretWidth) - (fretWidth / 2);
                    noteMarker.style.left = `${leftPos}px`;

                    // Audio Interaction
                    noteMarker.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent bubbling if needed
                        const freq = getNoteFrequency(stringObj.string, f);
                        playTone(freq);

                        // Visual Feedback
                        noteMarker.style.transform = 'translate(-50%, -50%) scale(1.3)';
                        setTimeout(() => {
                            noteMarker.style.transform = isHighlighted
                                ? 'translate(-50%, -50%) scale(1.1)'
                                : 'translate(-50%, -50%) scale(1)';
                        }, 100);
                    });

                    stringDiv.appendChild(noteMarker);
                }
            }
            fretboard.appendChild(stringDiv);
        });

        addInlays(numFrets, fretWidth);
    }

    function renderPiano(data, instrument, rangeType) {
        fretboard.className = 'piano-board'; // Reset to piano styling
        // Note: we're reusing the #fretboard DIV, so we just change class/content

        const range = MusicTheory.getPianoRange(rangeType);
        const mode = displayModeSelect ? displayModeSelect.value : 'notes';
        const chordSelection = chordSelect.value;
        const chordNotes = chordSelection === 'none' ? null : chordSelection.split(',');

        // Map Scale Data for easy lookup
        // node name -> { degree, interval }
        const scaleMap = {};
        data.scale_data.forEach(item => {
            scaleMap[item.note] = item;
        });

        // Loop MIDI Range
        for (let midi = range.start; midi <= range.end; midi++) {
            const index = midi % 12; // 0=C, 1=C#, etc
            const noteName = chromaticScale[index];
            const isBlack = [1, 3, 6, 8, 10].includes(index); // C#, D#, F#, G#, A#

            const keyDiv = document.createElement('div');
            keyDiv.className = `piano-key ${isBlack ? 'black-key' : 'white-key'}`;

            // Check if Note is in Scale
            const scaleInfo = scaleMap[noteName];

            if (scaleInfo) {
                // Determine if highlighted (Chord vs Scale)
                let isChordTone = false;
                if (chordNotes && chordNotes.includes(noteName)) {
                    isChordTone = true;
                }

                // If we are in "Chord Mode" (chordNotes not null), we typically ONLY highlight chord tones?
                // Or we highlight scale tones dimly and chord tones brightly?
                // Visualizer logic in Fretboard was: Badges show for all scale notes.
                // Replicate Fretboard Logic:
                // If Chord Selected:
                //   - Highlight Chord Tones (Visible)
                //   - Scale Tones (Normal/Dimmed implicitly by lack of highlight class)

                // Create Marker
                const marker = document.createElement('div');
                marker.className = `key-marker ${getIntervalClass(scaleInfo.interval)}`;

                if (isChordTone) {
                    marker.classList.add('highlight-chord');
                    // Characteristic check
                    if (data.characteristic_intervals && data.characteristic_intervals.includes(scaleInfo.interval)) {
                        marker.classList.add('characteristic');
                    }
                } else if (!chordNotes) {
                    // No chord, normal scale view
                    // Characteristic check
                    if (data.characteristic_intervals && data.characteristic_intervals.includes(scaleInfo.interval)) {
                        marker.classList.add('characteristic');
                    }
                } else {
                    // Chord mode, but this key is just a scale note, not chord tone
                    // Add 'dimmed' class if we want less visibility?
                    marker.classList.add('dimmed');
                }

                // Text
                marker.textContent = mode === 'intervals' ? scaleInfo.interval : noteName;

                keyDiv.appendChild(marker);
            }

            // Audio
            keyDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                // Calc Freq from MIDI
                const freq = 440 * Math.pow(2, (midi - 69) / 12);
                playTone(freq);

                // Visual
                keyDiv.classList.add('active');
                setTimeout(() => keyDiv.classList.remove('active'), 200);
            });

            fretboard.appendChild(keyDiv);
        }
    }

    function addInlays(numFrets, fretWidth) {
        const dots = [3, 5, 7, 9, 15, 17, 19, 21];
        const doubleDots = [12, 24];
        const totalHeight = 6 * 40;

        dots.forEach(f => {
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.style.left = `${(f * fretWidth) - (fretWidth / 2)}px`;
            marker.style.top = `${totalHeight / 2 - 10}px`;
            fretboard.appendChild(marker);
        });

        doubleDots.forEach(f => {
            const m1 = document.createElement('div');
            m1.className = 'fret-marker';
            m1.style.left = `${(f * fretWidth) - (fretWidth / 2)}px`;
            m1.style.top = `${(totalHeight / 3) - 10}px`;
            fretboard.appendChild(m1);

            const m2 = document.createElement('div');
            m2.className = 'fret-marker';
            m2.style.left = `${(f * fretWidth) - (fretWidth / 2)}px`;
            m2.style.top = `${(totalHeight * 2 / 3) - 10}px`;
            fretboard.appendChild(m2);
        });
    }

    function getIntervalClass(intervalName) {
        return `int-${intervalName}`;
    }

    function updateInfo(data) {
        scaleNameElement.textContent = `${data.root} ${data.type}`;
        scaleNotesElement.innerHTML = '';

        const chordSelection = chordSelect.value;
        const chordNotes = chordSelection === 'none' ? null : chordSelection.split(',');

        // Update Selected Chord Text
        if (chordNotes && chordSelect.selectedIndex > -1) {
            chordNameElement.textContent = `Selected Chord: ${chordSelect.options[chordSelect.selectedIndex].text}`;
        } else {
            chordNameElement.textContent = '';
        }

        data.scale_data.forEach((item, index) => {
            const badge = document.createElement('div');
            // Add interval class for styling (e.g., int-R, int-M3)
            badge.className = `note-badge ${getIntervalClass(item.interval)}`;
            badge.textContent = `${item.note}`;

            // Chord Highlighting Logic
            if (chordNotes) {
                if (chordNotes.includes(item.note)) {
                    badge.classList.add('highlight-chord');
                    // Check intersection
                    if (data.characteristic_intervals && data.characteristic_intervals.includes(item.interval)) {
                        badge.classList.add('characteristic');
                    }
                } else {
                    // No dimming
                }
            } else {
                if (item.interval === 'R') badge.classList.add('root-badge-default');
                // Characteristic logic for badges
                if (data.characteristic_intervals && data.characteristic_intervals.includes(item.interval)) {
                    badge.classList.add('characteristic');
                }
            }

            scaleNotesElement.appendChild(badge);
        });
    }

    // Event Listeners
    rootSelect.addEventListener('change', () => {
        updateScale();
        updateDronePivot();
    });
    scaleSelect.addEventListener('change', updateScale);
    if (displayModeSelect) {
        displayModeSelect.addEventListener('change', () => renderFretboard(currentScaleData));
    }
    if (chordSelect) {
        chordSelect.addEventListener('change', () => {
            renderFretboard(currentScaleData);
            updateInfo(currentScaleData);
        });
    }
    if (complexitySelect) {
        complexitySelect.addEventListener('change', updateScale);
    }
    if (tuningSelect) {
        tuningSelect.addEventListener('change', updateScale);
    }

    // Save Image Feature
    const saveBtn = document.getElementById('save-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');

    // Toggle Settings Panel
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('hidden');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
            settingsPanel.classList.add('hidden');
        }
    });
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            // We capture the fretboard container to get the whole scrollable area if we want, 
            // but usually we want the visible part or the specific #fretboard element.
            // Let's capture #fretboard to get the wood background and everything.

            // Visual feedback
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Capturing...';

            html2canvas(document.querySelector("#fretboard"), {
                backgroundColor: null, // Keep transparency if any (though we have wood bg)
                scale: 2 // High res
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Fretboard-${scaleNameElement.textContent.replace(/\s+/g, '-')}.png`;
                link.href = canvas.toDataURL();
                link.click();

                saveBtn.textContent = originalText;
            }).catch(err => {
                console.error('Capture failed:', err);
                saveBtn.textContent = 'Error ❌';
                setTimeout(() => saveBtn.textContent = originalText, 2000);
            });
        });
    }

    // Init
    updateTunings();
});
