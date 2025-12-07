class AudioEngine {
    constructor() {
        this.ctx = null;
        this.droneOsc = null;
        this.droneGain = null;
        this.isDroneOn = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    getNoteFrequency(stringNum, fret, tuningMidi) {
        // stringNum is 1-based logic from original, but tuningMidi is 0-based array
        // tuningMidi: [LowE, A, D, G, B, HighE]
        const openMidi = tuningMidi[stringNum - 1];
        const midi = openMidi + fret;
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    playTone(freq, time = null, duration = 2.0) {
        this.init();
        const t = time !== null ? time : this.ctx.currentTime;
        const release = 0.8; // Long tail for resonance
        const stopTime = t + duration + release;

        // Master Gain (Per Note)
        const masterGain = this.ctx.createGain();
        masterGain.connect(this.ctx.destination);

        // ADSR Envelope
        // A: 0.05s, D: 0.2s, S: 0.8 level, R: 0.8s
        masterGain.gain.setValueAtTime(0, t);
        masterGain.gain.linearRampToValueAtTime(0.12, t + 0.05); // Soft Attack
        masterGain.gain.exponentialRampToValueAtTime(0.08, t + 0.3); // Decay to Sustain
        masterGain.gain.setValueAtTime(0.08, t + duration); // Hold Sustain
        masterGain.gain.exponentialRampToValueAtTime(0.001, stopTime); // Release

        // --- 1. Warm Fundamental (Triangle) ---
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.value = freq;

        // --- 2. String Brightness (Sawtooth, slight detune) ---
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.value = freq;
        osc2.detune.value = 12; // Chorus effect

        // Filter for brightness control
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(freq * 4, t);
        filter.frequency.linearRampToValueAtTime(freq * 2, t + 0.5); // Envelope filter

        // Mixing: Osc1 (Body) + Filtered Osc2 (Bright) -> Master
        // Use gain nodes to balance mix if needed, or just sum.
        const osc1Gain = this.ctx.createGain();
        osc1Gain.gain.value = 0.7; // 70% Body

        const osc2Gain = this.ctx.createGain();
        osc2Gain.gain.value = 0.3; // 30% Sparkle

        osc1.connect(osc1Gain);
        osc1Gain.connect(masterGain);

        osc2.connect(filter);
        filter.connect(osc2Gain);
        osc2Gain.connect(masterGain);

        osc1.start(t);
        osc1.stop(stopTime);
        osc2.start(t);
        osc2.stop(stopTime);
    }

    playChord(frequencies, time = null, duration = 2.0) {
        this.init();
        const t = time !== null ? time : this.ctx.currentTime;
        // Stagger strumming slightly?
        let offset = 0;
        frequencies.forEach((f, i) => {
            this.playTone(f, t + offset, duration);
            offset += 0.03; // 30ms strum delay
        });
    }

    toggleDrone(rootName, chromaticScale) {
        if (this.isDroneOn) {
            this.stopDrone();
            return false; // state is now off
        } else {
            this.startDrone(rootName, chromaticScale);
            return true; // state is now on
        }
    }

    startDrone(rootName, chromaticScale) {
        this.init();
        const freq = this.getRootFrequency(rootName, chromaticScale);
        const t = this.ctx.currentTime;

        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        this.droneOsc.type = 'triangle';
        this.droneOsc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.value = 800;

        this.droneGain.gain.setValueAtTime(0, t);
        this.droneGain.gain.linearRampToValueAtTime(0.1, t + 1);

        this.droneOsc.connect(filter);
        filter.connect(this.droneGain);
        this.droneGain.connect(this.ctx.destination);

        this.droneOsc.start(t);
        this.isDroneOn = true;
    }

    stopDrone() {
        if (this.droneOsc) {
            const t = this.ctx.currentTime;
            this.droneGain.gain.exponentialRampToValueAtTime(0.001, t + 1);
            this.droneOsc.stop(t + 1);
            this.droneOsc = null;
            this.droneGain = null;
        }
        this.isDroneOn = false;
    }

    updateDroneFrequency(rootName, chromaticScale) {
        if (this.isDroneOn && this.droneOsc) {
            const freq = this.getRootFrequency(rootName, chromaticScale);
            const t = this.ctx.currentTime;
            this.droneOsc.frequency.setValueAtTime(freq, t);
        }
    }

    getRootFrequency(rootName, chromaticScale) {
        const index = chromaticScale.indexOf(rootName);
        if (index === -1) return 261.63;
        const midi = 60 + index;
        return 440 * Math.pow(2, (midi - 69) / 12);
    }
}
