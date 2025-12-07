class UI {
    constructor(audioEngine, state) {
        this.audioEngine = audioEngine;
        this.state = state;

        // Elements
        this.fretboard = document.getElementById('fretboard');
        this.scaleNotesDisplay = document.getElementById('scale-notes');
        this.currentScaleName = document.getElementById('current-scale-name');
        this.instrumentSelect = document.getElementById('instrument-select');
        this.tuningSelect = document.getElementById('tuning-select');
        this.rootSelect = document.getElementById('root-select');
        this.scaleSelect = document.getElementById('scale-select');
        this.displayModeSelect = document.getElementById('display-mode');
        this.settingsPanel = document.getElementById('settings-panel');
        this.diatonicGrid = document.querySelector('.diatonic-grid');
        this.progressionTimeline = document.getElementById('progression-timeline');
        this.progressionGraph = document.getElementById('progression-graph');
    }

    // Populate dropdowns (Initial setup)
    initControls(scaleTypes, instruments) {
        // Roots
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.rootSelect.innerHTML = notes.map(n => `<option value="${n}">${n}</option>`).join('');

        // Instruments
        this.instrumentSelect.innerHTML = Object.keys(instruments)
            .map(k => `<option value="${k}">${k}</option>`)
            .join('');
    }

    render(data, instrument, rangeType) {
        this.currentScaleName.textContent = `${data.root} ${data.type_name}`;
        this.renderScaleInfo(data);

        // Fretboard or Piano?
        if (rangeType && rangeType.toLowerCase().includes('piano')) {
            this.renderPiano(data, instrument, rangeType);
        } else {
            this.renderFretboard(data, instrument);
        }

        // Render Diatonic Chords
        this.renderDiatonicChords(data);

        // Render Progression Explorer
        this.renderProgressionUI(data);
    }

    renderScaleInfo(data) {
        this.scaleNotesDisplay.innerHTML = '';
        const mode = this.displayModeSelect ? this.displayModeSelect.value : 'notes';

        data.scale_data.forEach(item => {
            const badge = document.createElement('div');
            // Determine interval class
            const intervalClass = this.getIntervalClass(item.interval);
            badge.className = `note-badge ${intervalClass}`;

            // Highlight characteristic notes in the list too?
            if (data.characteristic_intervals && data.characteristic_intervals.includes(item.interval)) {
                badge.classList.add('characteristic');
            }

            badge.textContent = mode === 'intervals' ? item.interval : item.note;
            this.scaleNotesDisplay.appendChild(badge);
        });
    }

    getIntervalClass(interval) {
        // Map interval string to CSS class
        // e.g. "m2" -> "int-m2"
        return `int-${interval}`;
    }

    renderFretboard(data, instrument) {
        this.fretboard.innerHTML = '';
        this.fretboard.className = ''; // Reset class

        // Add instrument-specific class for string thickness
        if (instrument.name.toLowerCase().includes('bass')) {
            this.fretboard.classList.add('inst-bass');
        } else if (instrument.name.toLowerCase().includes('ukulele')) {
            this.fretboard.classList.add('inst-uke');
        } else if (instrument.name.toLowerCase().includes('banjo')) {
            this.fretboard.classList.add('inst-banjo');
        }

        const numStrings = instrument.strings.length;
        const numFrets = 24;
        const fretWidth = 60;
        const startX = 60; // Start visual area at 60px from left (Nut position)

        // Width: Start + Frets + End Padding
        this.fretboard.style.width = `${startX + (numFrets * fretWidth) + 60}px`;
        this.fretboard.style.paddingLeft = '0px'; // Reset padding

        // Sync Background Grid to Fret Width (Critical for alignment)
        // Layer 1 (Vertical Frets): Strong Fret Wire (Silver)
        // Layer 2 (Horizontal Grid): Subtle
        // Layer 3 (Wood Texture): Radial
        this.fretboard.style.backgroundImage = `
            linear-gradient(90deg, transparent ${fretWidth - 3}px, rgba(160, 160, 160, 0.6) ${fretWidth - 3}px, rgba(160, 160, 160, 0.6) ${fretWidth}px),
            linear-gradient(rgba(0, 0, 0, 0.2) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02), transparent 60%)
        `.replace(/\n\s+/g, ' ').trim();

        // 60px width for frets. 40px height for horizontal grid (matches string height approximately)
        this.fretboard.style.backgroundSize = `${fretWidth}px 100%, 100% 20px, 100% 100%`;

        // Render Fret Markers (Inlays)
        const markers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
        markers.forEach(fret => {
            const isDouble = (fret === 12 || fret === 24);
            const markerContainer = document.createElement('div');
            // Inline Styles for simplicity
            markerContainer.style.position = 'absolute';
            markerContainer.style.left = `${startX + (fret * fretWidth) - (fretWidth / 2)}px`;
            markerContainer.style.top = '50%';
            markerContainer.style.transform = 'translate(-50%, -50%)';
            markerContainer.style.display = 'flex';
            markerContainer.style.flexDirection = 'column';
            markerContainer.style.gap = '36px'; // Space between double dots
            markerContainer.style.pointerEvents = 'none'; // Don't block clicks
            markerContainer.style.zIndex = '0';

            const createDot = () => {
                const dot = document.createElement('div');
                dot.style.width = '24px';
                dot.style.height = '24px';
                dot.style.backgroundColor = 'rgba(230, 230, 230, 0.35)'; // Visible pearl-ish
                dot.style.borderRadius = '50%';
                dot.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
                return dot;
            };

            if (isDouble) {
                markerContainer.appendChild(createDot());
                markerContainer.appendChild(createDot());
            } else {
                markerContainer.appendChild(createDot());
            }

            this.fretboard.appendChild(markerContainer);
        });

        // Generate Strings
        instrument.strings.slice().reverse().forEach((stringObj, i) => {
            const stringDiv = document.createElement('div');
            stringDiv.className = 'string';

            // Generate Frets for this string
            for (let f = 0; f <= numFrets; f++) {
                const midiAtFret = stringObj.midi + f;
                const noteName = MusicTheory.getNoteFromMidi(midiAtFret);

                // Check if in scale (handle enharmonics)
                const scaleItem = data.scale_data.find(item => MusicTheory.normalizeNote(item.note) === MusicTheory.normalizeNote(noteName));

                if (scaleItem) {
                    // Check if highlighted (chord)
                    const chordNotes = this.state.selectedChordData ? this.state.selectedChordData.notes : null;
                    let isHighlighted = false;
                    if (chordNotes) {
                        isHighlighted = chordNotes.some(cn => MusicTheory.normalizeNote(cn) === MusicTheory.normalizeNote(noteName));
                    }

                    const noteMarker = document.createElement('div');
                    noteMarker.className = `note-marker ${this.getIntervalClass(scaleItem.interval)}`;

                    if (isHighlighted) {
                        noteMarker.classList.add('highlight-chord');
                        noteMarker.style.zIndex = '10';
                        noteMarker.style.transform = 'translate(-50%, -50%) scale(1.1)';
                        if (data.characteristic_intervals && data.characteristic_intervals.includes(scaleItem.interval)) {
                            noteMarker.classList.add('characteristic');
                        }
                    } else if (!chordNotes) {
                        if (this.state.selectedChordData) {
                            noteMarker.classList.add('dimmed');
                        }
                        if (!this.state.selectedChordData && data.characteristic_intervals && data.characteristic_intervals.includes(scaleItem.interval)) {
                            noteMarker.classList.add('characteristic');
                        }
                    } else {
                        noteMarker.classList.add('dimmed');
                    }

                    const mode = this.displayModeSelect ? this.displayModeSelect.value : 'notes';
                    noteMarker.textContent = mode === 'intervals' ? scaleItem.interval : scaleItem.note;

                    // Position (Positive Coordinates)
                    noteMarker.style.left = `${startX + (f * 60) - 30}px`;

                    noteMarker.addEventListener('click', (e) => {
                        e.stopPropagation();
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

        // Add Fret Lines (Vertical) & Numbers
        for (let f = 0; f <= numFrets; f++) {
            const lineX = startX + (f * 60);

            if (f > 0) {
                const fretLine = document.createElement('div');
                fretLine.className = 'fret-line';
                fretLine.style.left = `${lineX}px`;
                this.fretboard.appendChild(fretLine);
            }

            if (f === 0) {
                const nutLine = document.createElement('div');
                nutLine.className = 'fret-line';
                nutLine.style.left = `${startX}px`;
                nutLine.style.width = '6px';
                nutLine.style.backgroundColor = '#444';
                this.fretboard.appendChild(nutLine);
            }

            const fretNum = document.createElement('div');
            fretNum.className = 'fret-number';
            fretNum.textContent = f;
            if (f === 0) {
                fretNum.style.fontWeight = 'bold';
                fretNum.style.color = 'var(--accent-color)';
            }
            fretNum.style.left = `${startX + (f * 60) - 30}px`;
            this.fretboard.appendChild(fretNum);
        }

        this.addInlays(numFrets, 60, startX);
    }

    renderPiano(data, instrument, rangeType) {
        this.fretboard.innerHTML = '';
        this.fretboard.style.width = '';
        this.fretboard.style.paddingLeft = '';

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

    addInlays(numFrets, fretWidth, startX = 60) {
        const dots = [3, 5, 7, 9, 15, 17, 19, 21];
        const doubleDots = [12, 24];
        const totalHeight = 6 * 40;

        dots.forEach(f => {
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.style.left = `${startX + (f * fretWidth) - (fretWidth / 2)}px`;
            marker.style.top = `${totalHeight / 2 - 10}px`;
            this.fretboard.appendChild(marker);
        });

        doubleDots.forEach(f => {
            const m1 = document.createElement('div');
            m1.className = 'fret-marker';
            m1.style.left = `${startX + (f * fretWidth) - (fretWidth / 2)}px`;
            m1.style.top = `${(totalHeight / 3) - 10}px`;
            this.fretboard.appendChild(m1);

            const m2 = document.createElement('div');
            m2.className = 'fret-marker';
            m2.style.left = `${startX + (f * fretWidth) - (fretWidth / 2)}px`;
            m2.style.top = `${(totalHeight * 2 / 3) - 10}px`;
            this.fretboard.appendChild(m2);
        });
    }

    // --- Progression UI Methods ---

    renderProgressionUI(data) {
        if (!this.progressionTimeline || !this.progressionGraph) return;

        // 1. Render Timeline
        this.progressionTimeline.innerHTML = '';
        if (this.state.progression.length === 0) {
            this.progressionTimeline.innerHTML = '<div class="timeline-start-msg">Select a chord from the Grid or Graph to begin...</div>';
        } else {
            this.state.progression.forEach((chord, idx) => {
                const item = document.createElement('div');
                item.className = 'timeline-item';

                // Transition Info (Badge)
                let metaHtml = '';
                if (chord.transitionIcon) {
                    metaHtml = `<div class="t-meta" title="${chord.transitionLabel}">${chord.transitionIcon}</div>`;
                }

                item.style.position = 'relative'; // Ensure positioning context
                item.innerHTML = `
                    ${metaHtml}
                    <div class="t-roman">${chord.roman}</div>
                    <div class="t-name">${chord.name}</div>
                    <div class="t-func">${chord.function || ''}</div>
                `;

                // Add Delete Btn
                const delBtn = document.createElement('div');
                delBtn.className = 't-delete';
                delBtn.textContent = '❌';
                delBtn.title = 'Delete from here';
                delBtn.style.cssText = "position: absolute; top: -5px; right: -5px; cursor: pointer; font-size: 0.8em; background: rgba(0,0,0,0.5); border-radius: 50%; padding: 2px;";
                delBtn.onclick = (e) => {
                    e.stopPropagation();

                    // Restoration Logic
                    const remaining = this.state.progression.slice(0, idx);
                    let targetKey = null;

                    // Search backwards for the last defined Tonality
                    for (let k = remaining.length - 1; k >= 0; k--) {
                        const node = remaining[k];
                        if (node.keyContext) {
                            targetKey = node.keyContext;
                            break;
                        }
                    }

                    // If we found a target key, restore it
                    if (targetKey) {
                        const rootSelect = document.getElementById('root-select');
                        const scaleSelect = document.getElementById('scale-select');
                        if (rootSelect && scaleSelect) {
                            // Check if actual change needed
                            if (rootSelect.value !== targetKey.root || scaleSelect.value !== targetKey.type) {
                                rootSelect.value = targetKey.root;
                                scaleSelect.value = targetKey.type;
                                rootSelect.dispatchEvent(new Event('change'));
                            }
                        }
                    }

                    this.state.truncateProgression(idx);
                };
                item.appendChild(delBtn);

                this.progressionTimeline.appendChild(item);

                if (idx < this.state.progression.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.className = 'timeline-arrow';
                    arrow.textContent = '→';
                    this.progressionTimeline.appendChild(arrow);
                }
            });
            // Auto scroll to end
            this.progressionTimeline.scrollLeft = this.progressionTimeline.scrollWidth;
        }

        // 2. Render Graph (Satellites)
        this.progressionGraph.innerHTML = '';

        let activeNode = this.state.activeGraphNode;
        // If no active node in graph, but we have a selection in grid, use that as seed.
        if (!activeNode && this.state.selectedChordData) {
            activeNode = this.state.selectedChordData;
        }

        if (!activeNode) {
            this.progressionGraph.innerHTML = '<div class="graph-placeholder">Select a starting chord from the Diatonic Grid to activate the graph.</div>';
            return;
        }

        // Center Node (Active)
        const centerNode = document.createElement('div');
        centerNode.className = 'graph-node center-node';
        centerNode.innerHTML = `
            <div class="g-roman">${activeNode.roman}</div>
            <div class="g-name">${activeNode.name}</div>
            <div class="g-func">${activeNode.function || ''}</div>
        `;
        // Playing center node sound?
        centerNode.addEventListener('click', () => {
            // Play chord tones?
            // Not implemented yet in audio engine for full chord, but could be neat.
        });
        this.progressionGraph.appendChild(centerNode);

        // Satellites (Suggestions)
        // Pass scale_data to allow calculation of secondary dominants
        const suggestions = MusicTheory.getProgressionSuggestions(activeNode, data.type, data.scale_data);

        // Diatonic Source Pool
        const allTriads = MusicTheory.getDiatonicChords(data.scale_data, 'triad', data.type);
        const allSevenths = MusicTheory.getDiatonicChords(data.scale_data, 'seventh', data.type);
        const isSeventhMode = activeNode.name.includes('7');
        const sourcePool = isSeventhMode ? allSevenths : allTriads;

        const total = suggestions.length;

        suggestions.forEach((sugg, i) => {
            let targetChord = null;

            // SPECIAL: Modulation Node
            if (sugg.type === 'modulation') {
                // Calculate position (same logic)
                const angle = (i / total) * 2 * Math.PI - (Math.PI / 2);
                const offsetX = Math.cos(angle) * 220;
                const offsetY = Math.sin(angle) * 220;

                const node = document.createElement('div');
                node.className = `graph-node satellite-node sugg-modulation`;
                node.style.left = `calc(50% + ${offsetX}px)`;
                node.style.top = `calc(50% + ${offsetY}px)`;
                node.style.borderColor = '#ffd700'; // Gold border
                node.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';

                node.innerHTML = `
                    <div class="g-roman">KEY</div>
                    <div class="g-name" style="font-size: 0.9em;">${sugg.newKey.root} ${sugg.newKey.type}</div>
                    <div class="g-func">Modulate</div>
                    <div class="g-type-icon">🚀</div>
                `;

                node.addEventListener('click', () => {
                    // 1. Add Marker to History
                    const modNode = {
                        roman: 'Key Change',
                        name: `${sugg.newKey.root} ${sugg.newKey.type}`,
                        function: 'Modulation',
                        transitionType: 'modulation',
                        transitionIcon: '🚀',
                        transitionLabel: `Modulating to ${sugg.newKey.root}`,
                        keyContext: sugg.newKey // Store for restore
                    };
                    this.state.addToProgression(modNode);

                    // 2. Trigger Global Key Change
                    const rootSelect = document.getElementById('root-select');
                    const scaleSelect = document.getElementById('scale-select');

                    if (rootSelect && scaleSelect) {
                        rootSelect.value = sugg.newKey.root;
                        scaleSelect.value = sugg.newKey.type;

                        // Trigger update
                        rootSelect.dispatchEvent(new Event('change'));
                    }
                });

                this.progressionGraph.appendChild(node);
                return; // Done for this suggestion
            }

            // 1. Check if suggestion provides full chord data (Secondary Dominant etc)
            if (sugg.chordData) {
                targetChord = sugg.chordData;
            }
            // 2. Fallback to Diatonic Lookup
            else if (sugg.degree) {
                targetChord = sourcePool.find(c => c.degree === sugg.degree);
            }

            if (!targetChord) return;

            // Calculate position
            const angle = (i / total) * 2 * Math.PI - (Math.PI / 2); // Start top
            const radius = 220; // Slightly larger for extra info?

            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            const node = document.createElement('div');
            // Add specific class for type styling (e.g. .sugg-secondary)
            node.className = `graph-node satellite-node sugg-${sugg.type}`;

            node.style.left = `calc(50% + ${offsetX}px)`;
            node.style.top = `calc(50% + ${offsetY}px)`;

            // Ensure Function is displayed. 
            // For diatonic: use targetChord.function.
            // For custom: use sugg.label or targetChord.function (I set 'Sec. Dom' in logic).
            // Prioritize specific label from suggestion engine (e.g. "Relative Minor")
            // Fallback to generic function (e.g. "Tonic")
            const funcLabel = sugg.label || targetChord.function || '';

            node.innerHTML = `
                <div class="g-roman">${targetChord.roman}</div>
                <div class="g-name">${targetChord.name}</div>
                <div class="g-func">${funcLabel}</div>
                <div class="g-type-icon">${this.getSuggIcon(sugg.type)}</div>
            `;

            // Interaction: Click to Travel
            node.addEventListener('click', () => {
                // If it's the first chord, add the start node too? 
                // Currently Logic: addToProgression just pushes. 
                // But we want to preserve the *transition* logic.

                if (this.state.progression.length === 0) {
                    // Add the seed node as 'start'
                    const seed = {
                        ...activeNode,
                        transitionType: 'start',
                        transitionIcon: '🏁',
                        keyContext: { root: this.state.settings.root, type: this.state.settings.scaleType } // Capture Initial Key
                    };
                    this.state.addToProgression(seed);
                }

                // Add target with transition metadata
                const historyNode = {
                    ...targetChord,
                    transitionType: sugg.type,
                    transitionIcon: this.getSuggIcon(sugg.type),
                    transitionLabel: sugg.label || ''
                };
                this.state.addToProgression(historyNode);
            });

            this.progressionGraph.appendChild(node);
        });
    }

    getSuggIcon(type) {
        switch (type) {
            case 'resolve': return '↙️';
            case 'tension': return '↗️';
            case 'subdominant': return '➡️';
            case 'neutral': return '⏺️';
            case 'relative': return '🔗';
            case 'deceptive': return '⚡';
            case 'secondary': return '🔄';
            case 'borrowed': return '🌑';
            case 'chromatic': return '🎨';
            case 'modulation': return '🚀';
            default: return '➡️';
        }
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
                    // Also set as active node for graph if empty
                    if (this.state.progression.length === 0) {
                        this.state.activeGraphNode = triad;
                    }
                }
                this.state.triggerUpdate();
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
                    if (this.state.progression.length === 0) {
                        this.state.activeGraphNode = seventh;
                    }
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
