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

        this.progression = []; // Array of chord objects
        this.activeGraphNode = null; // The chord currently centered in the graph
    }

    addToProgression(chord) {
        this.progression.push(chord);
        this.activeGraphNode = chord;
        this.triggerUpdate();
    }

    resetProgression() {
        this.progression = [];
        this.activeGraphNode = null;
        this.triggerUpdate();
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
