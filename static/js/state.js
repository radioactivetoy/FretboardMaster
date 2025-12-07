class State {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;

        this.selectedChordData = null; // { name, notes: [] } or null

        this.settings = {
            root: 'C',
            scaleType: 'Major',
            instrument: 'Guitar 6-String',
            tuning: 'Standard',
            displayMode: 'notes',
            complexity: 'triad' // internal default
        };
    }

    resetSelection() {
        this.selectedChordData = null;
    }

    triggerUpdate() {
        if (this.updateCallback) {
            this.updateCallback();
        }
    }
}
