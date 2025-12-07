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

    truncateProgression(index) {
        // Removes from 'index' to the end.
        if (index >= 0 && index < this.progression.length) {
            this.progression = this.progression.slice(0, index);

            // Update active node to the new last item
            if (this.progression.length > 0) {
                this.activeGraphNode = this.progression[this.progression.length - 1];
            } else {
                this.activeGraphNode = null;
            }
            this.triggerUpdate();
        }
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
