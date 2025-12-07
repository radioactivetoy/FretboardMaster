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

    playTone(freq) {
        this.init();
        const t = this.ctx.currentTime;

        // Master Gain
        const masterGain = this.ctx.createGain();
        masterGain.connect(this.ctx.destination);
        masterGain.gain.setValueAtTime(0.5, t);

        // --- 1. String Body ---
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const stringGain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.value = freq;

        osc2.type = 'sawtooth';
        osc2.frequency.value = freq;
        osc2.detune.value = 8;

        filter.type = 'lowpass';
        filter.Q.value = 3;
        filter.frequency.setValueAtTime(freq * 5, t);
        filter.frequency.exponentialRampToValueAtTime(freq, t + 0.3);

        stringGain.gain.setValueAtTime(0, t);
        stringGain.gain.linearRampToValueAtTime(1, t + 0.02);
        stringGain.gain.exponentialRampToValueAtTime(0.01, t + 2.0);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(stringGain);
        stringGain.connect(masterGain);

        osc1.start(t);
        osc1.stop(t + 2.0);
        osc2.start(t);
        osc2.stop(t + 2.0);

        // --- 2. Pick Attack ---
        const noiseBufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, noiseBufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        const noiseGain = this.ctx.createGain();

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noise.start(t);
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
