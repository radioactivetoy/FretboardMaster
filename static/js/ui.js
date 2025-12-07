

class UI {
    constructor(audioEngine, state) {
        this.audioEngine = audioEngine;
        this.state = state;

        // DOM Elements
        this.fretboard = document.getElementById('fretboard');
        this.scaleNameElement = document.getElementById('current-scale-name');
        this.chordNameElement = document.getElementById('selected-chord-name');
        this.scaleNotesElement = document.getElementById('scale-notes');
        this.diatonicGrid = document.querySelector('.diatonic-grid');
        this.displayModeSelect = document.getElementById('display-mode');
    }

    getIntervalClass(intervalName) {
        return `int-${intervalName}`;
    }

    updateInfo(data) {
        this.scaleNameElement.textContent = `${data.root} ${data.type}`;
        this.scaleNotesElement.innerHTML = '';

        let chordNotes = null;
        if (this.state.selectedChordData) {
            chordNotes = this.state.selectedChordData.notes;
            this.chordNameElement.textContent = `Selected Chord: ${this.state.selectedChordData.name}`;
            this.chordNameElement.style.opacity = '1';
        } else {
            this.chordNameElement.textContent = 'Select a chord below to highlight';
            this.chordNameElement.style.opacity = '0.6';
        }

        data.scale_data.forEach((item, index) => {
            const badge = document.createElement('div');
            badge.className = `note-badge ${this.getIntervalClass(item.interval)}`;
            badge.textContent = `${item.note}`;

            // Chord Highlighting Logic
            if (chordNotes) {
                if (chordNotes.includes(item.note)) {
                    badge.classList.add('highlight-chord');
                    if (data.characteristic_intervals && data.characteristic_intervals.includes(item.interval)) {
                        badge.classList.add('characteristic');
                    }
                }
            } else {
                if (item.interval === 'R') badge.classList.add('root-badge-default');
                if (data.characteristic_intervals && data.characteristic_intervals.includes(item.interval)) {
                    badge.classList.add('characteristic');
                }
            }

            this.scaleNotesElement.appendChild(badge);
        });

        this.renderDiatonicChords(data);
    }

    renderFretboard(data) {
        if (!data) return;
        this.fretboard.innerHTML = '';

        const instrument = this.state.settings.instrument;
        const isPiano = instrument.includes('Piano');

        if (isPiano) {
            this.renderPiano(data, instrument, this.state.settings.tuning);
            return;
        }

        // --- Guitar/Bass Rendering ---
        this.fretboard.className = ''; // Reset class
        if (instrument.toLowerCase().includes('bass')) {
            this.fretboard.classList.add('inst-bass');
        } else if (instrument.toLowerCase().includes('ukulele')) {
            this.fretboard.classList.add('inst-uke');
        } else if (instrument.toLowerCase().includes('banjo')) {
            this.fretboard.classList.add('inst-banjo');
        } else if (instrument.toLowerCase().includes('violin')) {
            this.fretboard.classList.add('inst-violin');
        } else {
            this.fretboard.classList.add('inst-guitar');
        }

        const mode = this.displayModeSelect ? this.displayModeSelect.value : 'notes';
        let chordNotes = this.state.selectedChordData ? this.state.selectedChordData.notes : null;

        const numFrets = 24;
        const fretWidth = 60; // px

        // Fret Numbers
        for (let i = 0; i <= numFrets; i++) {
            const number = document.createElement('div');
            number.className = 'fret-number';
            number.textContent = i;
            number.style.left = `${(i * fretWidth) + 30}px`;
            this.fretboard.appendChild(number);
        }

        const stringsToRender = [...data.fretboard].reverse();

        stringsToRender.forEach((stringObj, i) => {
            const stringDiv = document.createElement('div');
            stringDiv.className = 'string';
            stringDiv.style.width = `${numFrets * fretWidth}px`;

            const notesMap = {};
            stringObj.notes.forEach(n => notesMap[n.fret] = n);

            for (let f = 0; f <= numFrets; f++) {
                const fretPos = f * fretWidth;

                // Fret Lines
                if (i === 0 && f > 0) {
                    const actualLine = document.createElement('div');
                    actualLine.className = 'fret-line';
                    actualLine.style.left = `${fretPos}px`;
                    actualLine.style.height = `${stringsToRender.length * 40}px`;
                    this.fretboard.appendChild(actualLine);
                }

                if (notesMap[f]) {
                    const noteInfo = notesMap[f];
                    let isHighlighted = false;

                    if (chordNotes && chordNotes.includes(noteInfo.note)) {
                        isHighlighted = true;
                    }

                    const noteMarker = document.createElement('div');
                    noteMarker.className = `note-marker ${this.getIntervalClass(noteInfo.interval)}`;

                    if (isHighlighted) {
                        noteMarker.classList.add('highlight-chord');
                        noteMarker.style.zIndex = '10';
                        noteMarker.style.transform = 'translate(-50%, -50%) scale(1.1)';
                        if (data.characteristic_intervals && data.characteristic_intervals.includes(noteInfo.interval)) {
                            noteMarker.classList.add('characteristic');
                        }
                    } else if (!chordNotes && data.characteristic_intervals && data.characteristic_intervals.includes(noteInfo.interval)) {
                        noteMarker.classList.add('characteristic');
                    }

                    noteMarker.textContent = mode === 'intervals' ? noteInfo.interval : noteInfo.note;

                    const leftPos = f === 0 ? -30 : (f * fretWidth) - (fretWidth / 2);
                    noteMarker.style.left = `${leftPos}px`;

                    // Interaction
                    noteMarker.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // this.audioEngine.playNote(stringObj.string, f, data.tuning_midi); 
                        // Need to verify interface. 
                        // Simplest: pass frequency directly?
                        // Or pass string/fret to engine?
                        // Let's assume engine can handle freq or UI calculates it.
                        // Ideally UI shouldn't calculate physics, but `getNoteFrequency` was in script.js.
                        // I'll make AudioEngine expose a `playFreq` and helper `getFreq`.
                        const freq = this.audioEngine.getNoteFrequency(stringObj.string, f, data.tuning_midi);
                        this.audioEngine.playTone(freq);

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
            this.fretboard.appendChild(stringDiv);
        });

        this.addInlays(numFrets, fretWidth);
    }

    renderPiano(data, instrument, rangeType) {
        this.fretboard.className = 'piano-board';

        const range = MusicTheory.getPianoRange(rangeType);
        const mode = this.displayModeSelect ? this.displayModeSelect.value : 'notes';

        let chordNotes = this.state.selectedChordData ? this.state.selectedChordData.notes : null;

        const scaleMap = {};
        data.scale_data.forEach(item => {
            scaleMap[item.note] = item;
        });

        for (let midi = range.start; midi <= range.end; midi++) {
            const index = midi % 12;
            const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const noteName = chromaticScale[index];
            const isBlack = [1, 3, 6, 8, 10].includes(index);

            const keyDiv = document.createElement('div');
            keyDiv.className = `piano-key ${isBlack ? 'black-key' : 'white-key'}`;

            const scaleInfo = scaleMap[noteName];

            if (scaleInfo) {
                let isChordTone = false;
                if (chordNotes && chordNotes.includes(noteName)) {
                    isChordTone = true;
                }

                const marker = document.createElement('div');
                marker.className = `key-marker ${this.getIntervalClass(scaleInfo.interval)}`;

                if (isChordTone) {
                    marker.classList.add('highlight-chord');
                    if (data.characteristic_intervals && data.characteristic_intervals.includes(scaleInfo.interval)) {
                        marker.classList.add('characteristic');
                    }
                } else if (!chordNotes) {
                    if (data.characteristic_intervals && data.characteristic_intervals.includes(scaleInfo.interval)) {
                        marker.classList.add('characteristic');
                    }
                } else {
                    marker.classList.add('dimmed');
                }

                marker.textContent = mode === 'intervals' ? scaleInfo.interval : noteName;
                keyDiv.appendChild(marker);
            }

            keyDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                const freq = 440 * Math.pow(2, (midi - 69) / 12);
                this.audioEngine.playTone(freq);

                keyDiv.classList.add('active');
                setTimeout(() => keyDiv.classList.remove('active'), 200);
            });

            this.fretboard.appendChild(keyDiv);
        }
    }

    addInlays(numFrets, fretWidth) {
        const dots = [3, 5, 7, 9, 15, 17, 19, 21];
        const doubleDots = [12, 24];
        const totalHeight = 6 * 40;

        dots.forEach(f => {
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.style.left = `${(f * fretWidth) - (fretWidth / 2)}px`;
            marker.style.top = `${totalHeight / 2 - 10}px`;
            this.fretboard.appendChild(marker);
        });

        doubleDots.forEach(f => {
            const m1 = document.createElement('div');
            m1.className = 'fret-marker';
            m1.style.left = `${(f * fretWidth) - (fretWidth / 2)}px`;
            m1.style.top = `${(totalHeight / 3) - 10}px`;
            this.fretboard.appendChild(m1);

            const m2 = document.createElement('div');
            m2.className = 'fret-marker';
            m2.style.left = `${(f * fretWidth) - (fretWidth / 2)}px`;
            m2.style.top = `${(totalHeight * 2 / 3) - 10}px`;
            this.fretboard.appendChild(m2);
        });
    }

    renderDiatonicChords(data) {
        if (!this.diatonicGrid) return;
        this.diatonicGrid.innerHTML = '';

        const triads = MusicTheory.getDiatonicChords(data.scale_data, 'triad', data.type);
        const sevenths = MusicTheory.getDiatonicChords(data.scale_data, 'seventh', data.type);

        triads.forEach((triad, index) => {
            const seventh = sevenths[index];

            const card = document.createElement('div');
            card.className = 'chord-card';
            card.style.cursor = 'default';

            // Header
            const header = document.createElement('div');
            header.className = 'chord-header';
            header.innerHTML = `
                <div class="chord-title-row">
                    <span class="degree-label">${triad.roman}</span> 
                    <strong>${triad.root}</strong>
                </div>
                <div class="function-label">${triad.function}</div>
            `;
            card.appendChild(header);

            // --- TRIAD ZONE ---
            const triadInfo = document.createElement('div');
            triadInfo.className = 'chord-detail';

            if (this.state.selectedChordData && this.state.selectedChordData.name === triad.name) {
                triadInfo.classList.add('selected-detail');
            }

            triadInfo.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.state.selectedChordData && this.state.selectedChordData.name === triad.name) {
                    this.state.selectedChordData = null;
                } else {
                    this.state.selectedChordData = triad;
                }
                this.state.triggerUpdate(); // Callback to re-render everything
            });

            triadInfo.innerHTML = `<div class="chord-name">${triad.name}</div>`;

            const triadNotes = document.createElement('div');
            triadNotes.className = 'chord-notes-mini';
            triad.notes.forEach(note => {
                const scaleItem = data.scale_data.find(s => s.note === note);
                const intervalClass = scaleItem ? this.getIntervalClass(scaleItem.interval) : '';
                const dot = document.createElement('span');
                dot.className = `mini-badge ${intervalClass}`;
                dot.textContent = note;
                triadNotes.appendChild(dot);
            });
            triadInfo.appendChild(triadNotes);
            card.appendChild(triadInfo);

            // Separator
            const separator = document.createElement('div');
            separator.className = 'chord-separator';
            card.appendChild(separator);

            // --- SEVENTH ZONE ---
            const seventhInfo = document.createElement('div');
            seventhInfo.className = 'chord-detail';

            if (this.state.selectedChordData && this.state.selectedChordData.name === seventh.name) {
                seventhInfo.classList.add('selected-detail');
            }

            seventhInfo.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.state.selectedChordData && this.state.selectedChordData.name === seventh.name) {
                    this.state.selectedChordData = null;
                } else {
                    this.state.selectedChordData = seventh;
                }
                this.state.triggerUpdate();
            });

            seventhInfo.innerHTML = `<div class="chord-name">${seventh.name}</div>`;

            const seventhNotes = document.createElement('div');
            seventhNotes.className = 'chord-notes-mini';
            seventh.notes.forEach(note => {
                const scaleItem = data.scale_data.find(s => s.note === note);
                const intervalClass = scaleItem ? this.getIntervalClass(scaleItem.interval) : '';
                const dot = document.createElement('span');
                dot.className = `mini-badge ${intervalClass}`;
                dot.textContent = note;
                seventhNotes.appendChild(dot);
            });
            seventhInfo.appendChild(seventhNotes);
            card.appendChild(seventhInfo);

            this.diatonicGrid.appendChild(card);
        });
    }
}
