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

    // ... (omitting unchanged methods for brevity if possible, keeping Context) ...
    // Wait, I need to reliably target the block. I will target TUNINGS and getTuningMidi separately or the whole file if safer.
    // I'll target the whole TUNINGS block and getTuningMidi block.

    // Actually, I'll just rewrite getTuningMidi first.
    // The previous tool call output showed TUNINGS at line 20.


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

    static getDiatonicChords(scaleData, complexity = 'triad') {
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

            chords.push({
                degree: i + 1,
                root: root.note,
                notes: chordNotes,
                name: chordName
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

        // Strategy:
        // We know the "Standard" tuning intervals.
        // For extended range, we need a reliable baseline.
        // Safest bet: Assume the HIGHEST string is closer to standard High E (MIDI 64) 
        // and calculate downwards? Or define base MIDI for each known tuning?

        // Calculating relative to a fixed reference for every single string is tricky if we don't know the intended octave.
        // However, looking at the previous implementation:
        // it compared `stdNotes[i]` with `tuning[i]`. `stdNotes` was hardcoded 6 strings.

        // BETTER APPROACH: Define base MIDI for new tunings explicitly if possible, 
        // OR extend the reference array.
        // Since we are adding specific tunings '7 String Standard' (Low B) and '8 String (Low F#),
        // let's make a reference object for base OCTAVES or similar.

        // Simpler dynamic approach:
        // 1. Map note names to MIDI values relative to a reference (e.g., C4 = 60).
        // 2. Adjust for specific "Guitar Standard" octaves.
        // E2=40, A2=45, D3=50, G3=55, B3=59, E4=64.
        // 7-String Add: B1=35.
        // 8-String Add: F#1=30.

        // Let's create a robust parser that assumes the "highest" string is roughly E4 (64) 
        // and works backwards if the array is longer? 
        // No, standard tuning order in array is usually Low to High?
        // In TUNINGS object: ['E', 'A', 'D', 'G', 'B', 'E'] is Low->High?
        // Let's verify usage.
        // script.js: `stringsToRender = [...data.fretboard].reverse();`
        // getFretboardMapping iterates `tuning.forEach((openNoteRaw, stringIdx)`.
        // string 1 is index 0. `element.fret-line` height calculation suggests visual stacking.
        // Usually index 0 = Low E.

        // So for 7 string: ['B', 'E', 'A', 'D', 'G', 'B', 'E']
        // String 0 is B (Low).

        // Let's just implement a dedicated logic for known extended range patterns
        // or just hardcode the reference MIDI for the new supported tunings if logic is too brittle.

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
        const chords = MusicTheory.getDiatonicChords(scaleData, complexity);
        const fretboardMapping = MusicTheory.getFretboardMapping(scaleData, tuning);
        const tuningMidi = MusicTheory.getTuningMidi(tuning);
        const characteristicIntervals = MusicTheory.getCharacteristicIntervals(type);

        return {
            root: root,
            type: type,
            scale_data: scaleData,
            chords: chords,
            fretboard: fretboardMapping,
            tuning_midi: tuningMidi,
            characteristic_intervals: characteristicIntervals
        };
    }
}
