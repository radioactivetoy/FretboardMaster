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

    static TUNINGS = {
        'Standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'Drop D': ['D', 'A', 'D', 'G', 'B', 'E'],
        'Double Drop D': ['D', 'A', 'D', 'G', 'B', 'D'],
        'DADGAD': ['D', 'A', 'D', 'G', 'A', 'D'],
        'Open D': ['D', 'A', 'D', 'F#', 'A', 'D'],
        'Open G': ['D', 'G', 'D', 'G', 'B', 'D'],
        'Open E': ['E', 'B', 'E', 'G#', 'B', 'E'],
        'Eb Standard': ['Eb', 'Ab', 'Db', 'Gb', 'Bb', 'Eb'],
        'D Standard': ['D', 'G', 'C', 'F', 'A', 'D']
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

        const stdNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
        const stdMidi = [40, 45, 50, 55, 59, 64];

        for (let i = 0; i < 6; i++) {
            const targetNote = MusicTheory.normalizeNote(tuning[i]);
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
