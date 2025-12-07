document.addEventListener('DOMContentLoaded', () => {
    // --- Initialization ---
    const audioEngine = new AudioEngine();

    // Core Update Logic
    const updateApp = async () => {
        // Gather inputs
        const root = document.getElementById('root-select').value;
        const type = document.getElementById('scale-select').value;
        const tuning = document.getElementById('tuning-select').value;
        const instrument = document.getElementById('instrument-select').value;

        // Sync State
        state.settings.root = root;
        state.settings.scaleType = type;
        state.settings.tuning = tuning;
        state.settings.instrument = instrument;

        try {
            // Data Calculation
            const data = MusicTheory.getData(root, type, 'triad', tuning);

            // Audio Updates
            if (audioEngine.isDroneOn) {
                audioEngine.updateDroneFrequency(root, MusicTheory.CHROMATIC_SCALE);
            }

            // Rendering
            ui.updateInfo(data);
            ui.renderFretboard(data);

        } catch (error) {
            console.error('Error updating app:', error);
        }
    };

    const state = new State(updateApp);
    const ui = new UI(audioEngine, state);

    // --- DOM Elements ---
    const rootSelect = document.getElementById('root-select');
    const instrumentSelect = document.getElementById('instrument-select');
    const tuningSelect = document.getElementById('tuning-select');
    const scaleSelect = document.getElementById('scale-select');
    const displayModeSelect = document.getElementById('display-mode');
    const droneBtn = document.getElementById('drone-btn');
    const saveBtn = document.getElementById('save-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');

    // --- Population helpers ---
    function populateDropdowns() {
        // Roots
        MusicTheory.CHROMATIC_SCALE.forEach(note => {
            const temp = document.createElement('option');
            temp.value = note;
            temp.textContent = note;
            rootSelect.appendChild(temp);
        });

        // Instruments
        Object.keys(MusicTheory.INSTRUMENTS).forEach(inst => {
            const temp = document.createElement('option');
            temp.value = inst;
            temp.textContent = inst;
            instrumentSelect.appendChild(temp);
        });

        updateTunings();
    }

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

        // Trigger update
        updateApp();
    }

    // --- Event Listeners ---
    rootSelect.addEventListener('change', () => {
        state.resetSelection();
        updateApp();
    });

    scaleSelect.addEventListener('change', () => {
        state.resetSelection();
        updateApp();
    });

    instrumentSelect.addEventListener('change', () => {
        updateTunings();
        // updateTunings calls updateApp
    });

    tuningSelect.addEventListener('change', updateApp);

    if (displayModeSelect) {
        displayModeSelect.addEventListener('change', updateApp);
    }

    // Drone
    if (droneBtn) {
        droneBtn.addEventListener('click', () => {
            const stateOn = audioEngine.toggleDrone(rootSelect.value, MusicTheory.CHROMATIC_SCALE);
            if (stateOn) {
                droneBtn.textContent = "Drone 🔊";
                droneBtn.classList.add('active');
            } else {
                droneBtn.textContent = "Drone 🔇";
                droneBtn.classList.remove('active');
            }
        });
    }

    // Capture
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Capturing...';
            // We can rely on global html2canvas
            html2canvas(document.querySelector("#fretboard"), {
                backgroundColor: null,
                scale: 2
            }).then(canvas => {
                const link = document.createElement('a');
                const scaleName = document.getElementById('current-scale-name').textContent;
                link.download = `Fretboard-${scaleName.replace(/\s+/g, '-')}.png`;
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

    // Settings UI
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
            settingsPanel.classList.add('hidden');
        }
    });

    // --- Bootstrap ---
    populateDropdowns();
});
