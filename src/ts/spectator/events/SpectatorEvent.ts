/**
 * The base of all spectator events.
 */
export abstract class SpectatorEvent {
    /**
     * The time at which the event occurred, in milliseconds.
     */
    readonly time: number;

    constructor(time: number) {
        this.time = time;
    }

    /**
     * Determines whether this event results in a meaningful change when placed alongside another.
     *
     * @param existing An existing event to compare with.
     */
    abstract isRedundant(existing: SpectatorEvent): boolean;
}
