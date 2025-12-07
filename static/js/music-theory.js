class MusicTheory {
    static CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    static FLAT_EQUIVALENTS = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

    static INTERVAL_NAMES = {
        0: 'R',
        1: 'm2',
        2: 'M2',
        3: 'm3',
        4: 'M3',
        5: 'P4',
        6: 'd5',
        7: 'P5',
        8: 'm6',
        9: 'M6',
        10: 'm7',
        11: 'M7'
    };

    static INSTRUMENTS = {
        'Guitar 6-String': ['Standard', 'Drop D', 'Double Drop D', 'DADGAD', 'Open D', 'Open G', 'Open E', 'Eb Standard', 'D Standard'],
        'Guitar 7-String': ['7 String Standard'],
        'Guitar 8-String': ['8 String Standard'],
        'Bass 4-String': ['Bass Standard', 'Bass Drop D'],
        'Bass 5-String': ['Bass 5 Standard'],
        'Bass 6-String': ['Bass 6 Standard'],
        'Ukulele': ['Ukulele Standard (High G)', 'Ukulele Low G'],
        'Banjo': ['Banjo Open G'],
        'Violin': ['Violin Standard'],
        'Piano': ['Grand Piano (88 Keys)', 'Studio Piano (61 Keys)', 'Compact (49 Keys)']
    };

    static TUNINGS = {
        'Standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'Drop D': ['D', 'A', 'D', 'G', 'B', 'E'],
        'Double Drop D': ['D', 'A', 'D', 'G', 'B', 'D'],
        'DADGAD': ['D', 'A', 'D', 'G', 'A', 'D'],
        'Open D': ['D', 'A', 'D', 'F#', 'A', 'D'],
        'Open G': ['D', 'G', 'D', 'G', 'B', 'D'],
        'Open E': ['E', 'B', 'E', 'G#', 'B', 'E'],
        'Eb Standard': ['Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb'],
        'D Standard': ['D', 'G', 'C', 'F', 'A', 'D'],
        '7 String Standard': ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
        '8 String Standard': ['F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        'Bass Standard': ['E', 'A', 'D', 'G'],
        'Bass Drop D': ['D', 'A', 'D', 'G'],
        'Bass 5 Standard': ['B', 'E', 'A', 'D', 'G'],
        'Bass 6 Standard': ['B', 'E', 'A', 'D', 'G', 'C'],
        'Ukulele Standard (High G)': ['G', 'C', 'E', 'A'],
        'Ukulele Low G': ['G', 'C', 'E', 'A'],
        'Banjo Open G': ['G', 'D', 'G', 'B', 'D'],
        'Violin Standard': ['G', 'D', 'A', 'E'],
        // Piano Ranges (Placeholders for validation, logic handled in getPianoRange)
        'Grand Piano (88 Keys)': [],
        'Studio Piano (61 Keys)': [],
        'Compact (49 Keys)': []
    };

    static CHARACTERISTIC_INTERVALS = {
        'major': ['M7'],
        'ionian': ['M7'],
        'dorian': ['M6'],
        'phrygian': ['m2'],
        'lydian': ['d5'],
        'mixolydian': ['m7'],
        'minor': ['m6'],
        'aeolian': ['m6'],
        'locrian': ['d5', 'm2'],
        'harmonic_minor': ['M7', 'm6'],
        'phrygian_dominant': ['M3', 'm2'],
        'melodic_minor': ['M7', 'M6'],
        'lydian_dominant': ['d5', 'm7'],
        'super_locrian': ['d5', 'm6', 'm2']
    };

    static normalizeNote(note) {
        return MusicTheory.FLAT_EQUIVALENTS[note] || note;
    }

    static getNoteFromMidi(midi) {
        return MusicTheory.CHROMATIC_SCALE[midi % 12];
    }

    static getScale(rootName, scaleType) {
        rootName = MusicTheory.normalizeNote(rootName);
        if (!MusicTheory.CHROMATIC_SCALE.includes(rootName)) {
            throw new Error(`Invalid root note: ${rootName}`);
        }

        const rootIndex = MusicTheory.CHROMATIC_SCALE.indexOf(rootName);

        const scalePatterns = {
            'major': [0, 2, 4, 5, 7, 9, 11],
            'ionian': [0, 2, 4, 5, 7, 9, 11],
            'dorian': [0, 2, 3, 5, 7, 9, 10],
            'phrygian': [0, 1, 3, 5, 7, 8, 10],
            'lydian': [0, 2, 4, 6, 7, 9, 11],
            'mixolydian': [0, 2, 4, 5, 7, 9, 10],
            'minor': [0, 2, 3, 5, 7, 8, 10],
            'aeolian': [0, 2, 3, 5, 7, 8, 10],
            'locrian': [0, 1, 3, 5, 6, 8, 10],
            'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
            'locrian_6': [0, 1, 3, 5, 6, 9, 10],
            'ionian_5': [0, 2, 4, 5, 8, 9, 11],
            'dorian_4': [0, 2, 3, 6, 7, 9, 10],
            'phrygian_dominant': [0, 1, 4, 5, 7, 8, 10],
            'lydian_2': [0, 3, 4, 6, 7, 9, 11],
            'super_locrian_bb7': [0, 1, 3, 4, 6, 8, 9],
            'melodic_minor': [0, 2, 3, 5, 7, 9, 11],
            'dorian_b2': [0, 1, 3, 5, 7, 9, 10],
            'lydian_augmented': [0, 2, 4, 6, 8, 9, 11],
            'lydian_dominant': [0, 2, 4, 6, 7, 9, 10],
            'mixolydian_b6': [0, 2, 4, 5, 7, 8, 10],
            'locrian_2': [0, 2, 3, 5, 6, 8, 10],
            'super_locrian': [0, 1, 3, 4, 6, 8, 10],
            'major_pentatonic': [0, 2, 4, 7, 9],
            'minor_pentatonic': [0, 3, 5, 7, 10],
            'blues_minor': [0, 3, 5, 6, 7, 10]
        };

        const intervals = scalePatterns[scaleType.toLowerCase()];
        if (!intervals) {
            throw new Error(`Unsupported scale type: ${scaleType}`);
        }

        const scaleData = [];

        intervals.forEach((interval, i) => {
            const noteIndex = (rootIndex + interval) % 12;
            const noteName = MusicTheory.CHROMATIC_SCALE[noteIndex];
            const intervalName = MusicTheory.INTERVAL_NAMES[interval] || '?';

            scaleData.push({
                note: noteName,
                degree: i + 1,
                interval: intervalName,
                semitone: interval
            });
        });

        return scaleData;
    }

    static getDiatonicChords(scaleData, complexity = 'triad', scaleType = 'major') {
        const chords = [];
        const scaleLen = scaleData.length;

        for (let i = 0; i < scaleLen; i++) {
            const root = scaleData[i];
            const third = scaleData[(i + 2) % scaleLen];
            const fifth = scaleData[(i + 4) % scaleLen];
            const seventh = scaleData[(i + 6) % scaleLen];

            const chordNotes = [root.note, third.note, fifth.note];

            const semiRoot = root.semitone;
            const semiThird = third.semitone;
            const semiFifth = fifth.semitone;
            const semiSeventh = seventh.semitone;

            // Modulo 12 logic for wrapping
            const dist3rd = (semiThird - semiRoot + 12) % 12;
            const dist5th = (semiFifth - semiRoot + 12) % 12;
            const dist7th = (semiSeventh - semiRoot + 12) % 12;

            let quality = "Unknown";

            if (dist3rd === 4 && dist5th === 7) quality = "Major";
            else if (dist3rd === 3 && dist5th === 7) quality = "Minor";
            else if (dist3rd === 3 && dist5th === 6) quality = "Diminished";
            else if (dist3rd === 4 && dist5th === 8) quality = "Augmented";
            else if (dist3rd === 4 && dist5th === 6) quality = "b5";

            if (complexity === 'seventh') {
                chordNotes.push(seventh.note);

                if (quality === "Major") {
                    if (dist7th === 11) quality = "Maj7";
                    else if (dist7th === 10) quality = "Dom7";
                } else if (quality === "Minor") {
                    if (dist7th === 10) quality = "m7";
                    else if (dist7th === 11) quality = "m(maj7)";
                } else if (quality === "Diminished") {
                    if (dist7th === 10) quality = "m7b5";
                    else if (dist7th === 9) quality = "dim7";
                } else if (quality === "Augmented") {
                    if (dist7th === 11) quality = "Maj7#5";
                    else if (dist7th === 10) quality = "7#5";
                } else if (quality === "b5") {
                    if (dist7th === 10) quality = "7b5";
                }
            }

            const chordName = `${root.note} ${quality}`;

            // Roman Numeral Logic
            let roman = i + 1; // Default to number if weird
            const romanMap = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
            const romanBase = romanMap[i];

            if (quality.includes("Major") || quality.includes("Augmented") || quality.includes("Dom")) {
                roman = romanBase;
            } else {
                roman = romanBase.toLowerCase();
            }

            // Quality Suffix for Roman
            let romanSuffix = "";
            if (quality.includes("Diminished") || quality.includes("dim")) romanSuffix = "°";
            if (quality.includes("Augmented") || quality.includes("Aug")) romanSuffix = "+";
            if (quality.includes("b5") && !quality.includes("m7b5") && !quality.includes("dim")) romanSuffix = "(b5)";



            const romanNumeral = roman + romanSuffix;

            // Harmonic Function Logic
            let harmonicFunction = "";
            // Simplify scaleType
            const st = scaleType.toLowerCase();
            const sDegree = i + 1;

            if (st.includes('major') || st.includes('ionian')) {
                const map = { 1: 'Tonic', 2: 'Subdominant', 3: 'Tonic', 4: 'Subdominant', 5: 'Dominant', 6: 'Tonic', 7: 'Dominant' };
                harmonicFunction = map[sDegree];
            } else if (st.includes('minor') || st.includes('aeolian')) {
                const map = { 1: 'Tonic', 2: 'Subdominant', 3: 'Tonic', 4: 'Subdominant', 5: 'Dominant', 6: 'Subdominant', 7: 'Dominant' };
                harmonicFunction = map[sDegree];
            } else {
                const map = { 1: 'Tonic', 4: 'Subdominant', 5: 'Dominant' };
                harmonicFunction = map[sDegree] || "";
            }

            chords.push({
                degree: i + 1,
                root: root.note,
                notes: chordNotes,
                name: chordName,
                roman: romanNumeral,
                function: harmonicFunction
            });
        }

        return chords;
    }

    static getFretboardMapping(scaleData, tuningName = 'Standard') {
        const scaleNotes = scaleData.map(x => x.note);
        const noteToInfo = {};
        scaleData.forEach(x => noteToInfo[x.note] = x);

        const tuning = MusicTheory.TUNINGS[tuningName] || MusicTheory.TUNINGS['Standard'];
        const fretboard = [];

        tuning.forEach((openNoteRaw, stringIdx) => {
            const stringData = [];
            const openNote = MusicTheory.normalizeNote(openNoteRaw);
            const openNoteIdx = MusicTheory.CHROMATIC_SCALE.indexOf(openNote);

            for (let fret = 0; fret <= 24; fret++) {
                const currentNoteIdx = (openNoteIdx + fret) % 12;
                const currentNote = MusicTheory.CHROMATIC_SCALE[currentNoteIdx];

                if (scaleNotes.includes(currentNote)) {
                    const info = noteToInfo[currentNote];
                    stringData.push({
                        fret: fret,
                        note: currentNote,
                        degree: info.degree,
                        interval: info.interval
                    });
                }
            }
            fretboard.push({ string: stringIdx + 1, notes: stringData });
        });

        return fretboard;
    }

    static getTuningMidi(tuningName = 'Standard') {
        const tuning = MusicTheory.TUNINGS[tuningName] || MusicTheory.TUNINGS['Standard'];
        const midiValues = [];

        // Reference: Standard Tuning 6-string
        // Low E (E2) is MIDI 40.
        // E A D G B E
        // 40 45 50 55 59 64

        if (tuningName === '7 String Standard') {
            return [35, 40, 45, 50, 55, 59, 64]; // B1 to E4
        }
        if (tuningName === '8 String Standard') {
            return [30, 35, 40, 45, 50, 55, 59, 64]; // F#1 to E4
        }

        // --- BASS ---
        if (tuningName === 'Bass Standard') return [28, 33, 38, 43]; // E1 A1 D2 G2
        if (tuningName === 'Bass Drop D') return [26, 33, 38, 43]; // D1 A1 D2 G2
        if (tuningName === 'Bass 5 Standard') return [23, 28, 33, 38, 43]; // Low B0
        if (tuningName === 'Bass 6 Standard') return [23, 28, 33, 38, 43, 48]; // High C3

        // --- UKULELE ---
        if (tuningName === 'Ukulele Standard (High G)') return [67, 60, 64, 69]; // G4 C4 E4 A4
        if (tuningName === 'Ukulele Low G') return [55, 60, 64, 69]; // G3 C4 E4 A4

        // --- BANJO ---
        // Open G: g4 D3 G3 B3 D4
        if (tuningName === 'Banjo Open G') return [67, 50, 55, 59, 62];

        // --- VIOLIN ---
        if (tuningName === 'Violin Standard') return [55, 62, 69, 76]; // G3 D4 A4 E5

        // Default 6-string logic for variations of standard 6-string
        const stdNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
        const stdMidi = [40, 45, 50, 55, 59, 64];

        // If it's a 6-string tuning (like Drop D), run the diff logic against standard
        if (tuning.length === 6) {
            for (let i = 0; i < 6; i++) {
                const targetNote = MusicTheory.normalizeNote(tuning[i]);
                // ... relative logic ...
                // Re-implementing logic here since we are replacing the block
                const refNote = stdNotes[i];
                const refMidi = stdMidi[i];

                const targetIdx = MusicTheory.CHROMATIC_SCALE.indexOf(targetNote);
                const refIdx = MusicTheory.CHROMATIC_SCALE.indexOf(refNote);

                let diff = targetIdx - refIdx;

                if (diff > 6) diff -= 12;
                if (diff < -6) diff += 12;

                midiValues.push(refMidi + diff);
            }
            return midiValues;
        }

        return stdMidi;
    }

    static getPianoRange(type) {
        // MIDI Numbers: C4 = 60
        // 88 Keys: A0 (21) to C8 (108)
        // 61 Keys: C2 (36) to C7 (96)
        // 49 Keys: C3 (48) to C7 (96)

        if (type === 'Grand Piano (88 Keys)') return { start: 21, end: 108 };
        if (type === 'Studio Piano (61 Keys)') return { start: 36, end: 96 };
        if (type === 'Compact (49 Keys)') return { start: 48, end: 96 };

        return { start: 36, end: 96 }; // Default 61
    }

    static getCharacteristicIntervals(scaleType) {
        return MusicTheory.CHARACTERISTIC_INTERVALS[scaleType.toLowerCase()] || [];
    }

    // Main interface method to mimic the API response structure
    static getData(root, type, complexity, tuning) {
        const scaleData = MusicTheory.getScale(root, type);
        const chords = MusicTheory.getDiatonicChords(scaleData, complexity, type);

        const fretboardMapping = MusicTheory.getFretboardMapping(scaleData, tuning);
        const tuningMidi = MusicTheory.getTuningMidi(tuning);
        const characteristicIntervals = MusicTheory.getCharacteristicIntervals(type);

        // Format type name (e.g. "harmonic_minor" -> "Harmonic Minor")
        const typeName = type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return {
            root: root,
            type: type,
            type_name: typeName,
            scale_data: scaleData,
            chords: chords,
            fretboard: fretboardMapping,
            tuning_midi: tuningMidi,
            characteristic_intervals: characteristicIntervals
        };
    }

    static getChord(rootNote, quality, extension = '') {
        // Helper to generate a chord object on the fly (for non-diatonic chords)
        // quality: 'Major', 'Minor', 'Diminished', 'Augmented', 'Dominant'
        let intervals = [];
        let suffix = '';
        let typeName = quality;

        // Simple map for basic chord construction
        switch (quality.toLowerCase()) {
            case 'major': intervals = ['1P', '3M', '5P']; suffix = ''; break;
            case 'minor': intervals = ['1P', '3m', '5P']; suffix = 'm'; break;
            case 'diminished': intervals = ['1P', '3m', '5d']; suffix = 'dim'; break;
            case 'augmented': intervals = ['1P', '3M', '5A']; suffix = 'aug'; break;
            case 'dominant': intervals = ['1P', '3M', '5P', '7m']; suffix = '7'; break;
            case 'min7': intervals = ['1P', '3m', '5P', '7m']; suffix = 'm7'; break;
            case 'maj7': intervals = ['1P', '3M', '5P', '7M']; suffix = 'maj7'; break;
            case 'm7b5': intervals = ['1P', '3m', '5d', '7m']; suffix = 'm7b5'; break;
            case 'dim7': intervals = ['1P', '3m', '5d', '7d']; suffix = 'dim7'; break;
        }

        // If extension provided, override/append? For now assume quality covers it.
        // Calculate notes
        const rootIndex = MusicTheory.CHROMATIC_SCALE.indexOf(MusicTheory.normalizeNote(rootNote));
        const notes = intervals.map(int => {
            // Logic to get note at interval from root
            // We need an interval-to-semitone map
            // We have INTERVAL_NAMES which is array of arrays? No wait.
            // Let's rely on semitones.
            // 1P=0, 3m=3, 3M=4, 5d=6, 5P=7, 5A=8, 7d=9, 7m=10, 7M=11
            let semi = 0;
            if (int === '3m') semi = 3;
            if (int === '3M') semi = 4;
            if (int === '5d') semi = 6;
            if (int === '5P') semi = 7;
            if (int === '5A') semi = 8;
            if (int === '7d') semi = 9;
            if (int === '7m') semi = 10;
            if (int === '7M') semi = 11;

            return MusicTheory.CHROMATIC_SCALE[(rootIndex + semi) % 12];
        });

        // Determine Roman? Hard without context of key. This is for display.
        return {
            root: rootNote,
            name: `${rootNote}${suffix} `,
            quality: quality,
            notes: notes,
            roman: '?', // Will set in context
            degree: 0
        };
    }

    static getProgressionSuggestions(activeNode, scaleType, scaleData) {
        const suggestions = [];
        const st = scaleType.toLowerCase();
        const currentDegree = activeNode.degree || 0;
        const roman = activeNode.roman;

        // --- Helpers ---
        const getDiatonicNote = (deg) => {
            const idx = (deg - 1) % 7;
            return scaleData[idx] ? scaleData[idx].note : null;
        };

        const getNoteByInterval = (rootNote, semi) => {
            const idx = MusicTheory.CHROMATIC_SCALE.indexOf(MusicTheory.normalizeNote(rootNote));
            return MusicTheory.CHROMATIC_SCALE[(idx + semi) % 12];
        };

        const createChord = (root, quality, romanLabel, funcLabel, type) => {
            const chord = MusicTheory.getChord(root, quality);
            chord.roman = romanLabel;
            chord.name = `${root} ${quality === 'Dominant' ? '7' : quality === 'Minor' ? 'm' : ''}`;
            chord.function = funcLabel;
            return { type: type, label: romanLabel, chordData: chord, function: funcLabel };
        };

        // --- 1. Exotic/Non-Diatonic Resolution Logic ---
        if (currentDegree === 0 || !currentDegree) {
            if (roman === 'V7/V') {
                suggestions.push({ degree: 5, type: 'resolve', label: 'Resolve to V', function: 'Dominant' });
                suggestions.push({ degree: 1, type: 'deceptive', label: 'Return to I', function: 'Tonic' });
            } if (roman === 'V7/ii') {
                suggestions.push({ degree: 2, type: 'resolve', label: 'Resolve to ii', function: 'Supertonic' });
            } else if (roman === 'subV7') {
                suggestions.push({ degree: 1, type: 'resolve', label: 'Resolve to I', function: 'Tonic' });
            } else if (roman === 'iv') {
                suggestions.push({ degree: 1, type: 'resolve', label: 'Plagal Resolve', function: 'Tonic' });
            }
            // Fallback: If we don't know where we are, suggest a return to Tonic
            if (suggestions.length === 0) {
                suggestions.push({ degree: 1, type: 'resolve', label: 'Return Home', function: 'Tonic' });
            }
            return suggestions;
        }

        // --- 2. Advanced Diatonic Logic (Major/Ionian) ---
        if (st.includes('major') || st.includes('ionian')) {
            // -- Diatonic Moves --
            if (currentDegree === 1) { // I
                suggestions.push({ degree: 5, type: 'tension', label: 'Dominant (V)', function: 'Dominant' });
                suggestions.push({ degree: 4, type: 'subdominant', label: 'Subdominant (IV)', function: 'Subdominant' });
                suggestions.push({ degree: 2, type: 'subdominant', label: 'Supertonic (ii)', function: 'Pre-Dom' });
                suggestions.push({ degree: 6, type: 'relative', label: 'Relative Minor (vi)', function: 'Sub-Mediant' });
                suggestions.push({ degree: 3, type: 'neutral', label: 'Mediant (iii)', function: 'Mediant' });
            }
            else if (currentDegree === 2) { // ii
                suggestions.push({ degree: 5, type: 'tension', label: 'To Dominant (V)', function: 'Dominant' });
                suggestions.push({ degree: 7, type: 'tension', label: 'Leading Tone (vii°)', function: 'Dominant' });
                suggestions.push({ degree: 4, type: 'subdominant', label: 'Subdominant (IV)', function: 'Subdominant' });
            }
            else if (currentDegree === 3) { // iii
                suggestions.push({ degree: 6, type: 'resolve', label: 'Circle (vi)', function: 'Sub-Mediant' });
                suggestions.push({ degree: 4, type: 'subdominant', label: 'Deceptive (IV)', function: 'Subdominant' });
            }
            else if (currentDegree === 4) { // IV
                suggestions.push({ degree: 5, type: 'tension', label: 'To Dominant (V)', function: 'Dominant' });
                suggestions.push({ degree: 1, type: 'resolve', label: 'Plagal (I)', function: 'Tonic' });
                suggestions.push({ degree: 2, type: 'subdominant', label: 'Supertonic (ii)', function: 'Pre-Dom' });
            }
            else if (currentDegree === 5) { // V
                suggestions.push({ degree: 1, type: 'resolve', label: 'Perfect (I)', function: 'Tonic' });
                suggestions.push({ degree: 6, type: 'deceptive', label: 'Deceptive (vi)', function: 'Sub-Mediant' });
                suggestions.push({ degree: 4, type: 'subdominant', label: 'Retrogression (IV)', function: 'Subdominant' });
            }
            else if (currentDegree === 6) { // vi
                suggestions.push({ degree: 2, type: 'tension', label: 'Circle (ii)', function: 'Pre-Dom' });
                suggestions.push({ degree: 4, type: 'subdominant', label: 'Subdominant (IV)', function: 'Subdominant' });
                suggestions.push({ degree: 3, type: 'neutral', label: 'Mediant (iii)', function: 'Mediant' });
            }
            else if (currentDegree === 7) { // vii°
                suggestions.push({ degree: 1, type: 'resolve', label: 'Resolve (I)', function: 'Tonic' });
                suggestions.push({ degree: 3, type: 'neutral', label: 'To Mediant (iii)', function: 'Mediant' });
            }

            // -- PIVOT MODULATIONS --
            // 1. Pivot to Relative Minor (vi is new i)
            // Suggest V7/vi -> vi
            if ([1, 3, 4, 5].includes(currentDegree)) {
                const rootVi = getDiatonicNote(6); // A in C
                // Dominant of vi is E (III in C)
                const domOfRelative = getDiatonicNote(3); // E
                // We want E7 (V7/vi)
                suggestions.push(createChord(domOfRelative, 'Dominant', 'V7/vi', 'Sec. Dom', 'secondary'));
            }

            // -- SECONDARY DOMINANTS --
            // V7/V (D7 in C) -> From I, ii, IV, vi
            if ([1, 2, 4, 6].includes(currentDegree)) {
                const rootVofV = getDiatonicNote(2); // D
                suggestions.push(createChord(rootVofV, 'Dominant', 'V7/V', 'Sec. Dom', 'secondary'));
            }
            // V7/IV (C7 in C) -> From I, V
            if ([1, 5].includes(currentDegree)) {
                // Root is I (C). Quality Dom7.
                const rootVofIV = getDiatonicNote(1);
                suggestions.push(createChord(rootVofIV, 'Dominant', 'V7/IV', 'Sec. Dom', 'secondary'));
            }
            // V7/ii (A7 in C) -> From I, vi, iii
            if ([1, 3, 6].includes(currentDegree)) {
                const rootVofii = getDiatonicNote(6); // A
                suggestions.push(createChord(rootVofii, 'Dominant', 'V7/ii', 'Sec. Dom', 'secondary'));
            }

            // -- BORROWED CHORDS (Modal Interchange) --
            // iv (Minor Plagal) -> From I, IV, V
            if ([1, 4, 5].includes(currentDegree)) {
                const rootIV = getDiatonicNote(4);
                suggestions.push(createChord(rootIV, 'Minor', 'iv', 'Borrowed', 'borrowed'));
            }
            // bVI (Ab in C) -> From I, iv
            if (currentDegree === 1) {
                const rootNote = scaleData[0].note;
                const rootb6 = getNoteByInterval(rootNote, 8); // m6 interval
                suggestions.push(createChord(rootb6, 'Major', 'bVI', 'Borrowed', 'borrowed'));
            }
            // bVII (Bb in C) -> Backdoor Cadence
            if ([1, 4].includes(currentDegree)) {
                const rootNote = scaleData[0].note;
                const rootb7 = getNoteByInterval(rootNote, 10); // m7 interval
                suggestions.push(createChord(rootb7, 'Major', 'bVII', 'Backdoor', 'borrowed'));
            }

            // -- TRITONE SUBSTITUTION --
            // From V or ii -> subV7 (Db7 in C)
            if ([2, 5].includes(currentDegree)) {
                const rootNote = scaleData[0].note;
                const rootb2 = getNoteByInterval(rootNote, 1); // m2
                // subV7 typically resolves to I
                suggestions.push(createChord(rootb2, 'Dominant', 'subV7', 'Tritone Sub', 'chromatic'));
            }

            // --- ACTIVE MODULATION SUGGESTIONS ---
            // If we are on the vi (Relative Minor), offer effective key change
            if (currentDegree === 6) {
                const newRoot = activeNode.name.split(' ')[0]; // "A m" -> "A"
                suggestions.push({
                    type: 'modulation',
                    label: `Modulate to ${newRoot} Minor`,
                    newKey: { root: newRoot, type: 'Minor' }
                });
            }
            // If we are on the V (Dominant), offer modulation to Dominant Key
            if (currentDegree === 5) {
                const newRoot = activeNode.name.split(' ')[0];
                suggestions.push({
                    type: 'modulation',
                    label: `Modulate to ${newRoot} Major`,
                    newKey: { root: newRoot, type: 'Major' }
                });
            }
            // If we are on the IV (Subdominant), offer modulation to Subdominant Key
            if (currentDegree === 4) {
                const newRoot = activeNode.name.split(' ')[0];
                suggestions.push({
                    type: 'modulation',
                    label: `Modulate to ${newRoot} Major`,
                    newKey: { root: newRoot, type: 'Major' }
                });
            }
            // If we are on the I (Tonic), offer Parallel Minor modulation
            if (currentDegree === 1) {
                const newRoot = activeNode.name.split(' ')[0];
                suggestions.push({
                    type: 'modulation',
                    label: `Modulate to ${newRoot} Minor`,
                    newKey: { root: newRoot, type: 'Minor' }
                });
            }

        } else {
            // Fallback for minor/other scales for now (basic logic)
            const nextDeg = (currentDegree % 7) + 1;
            suggestions.push({ degree: 1, type: 'resolve', label: 'Return Home', function: 'Tonic' });
            suggestions.push({ degree: nextDeg, type: 'tension', label: 'Next Step', function: 'Step' });
        }

        return suggestions;
    }
}
