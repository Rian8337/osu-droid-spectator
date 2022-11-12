/**
 * The base of all spectator events.
 */
export interface SpectatorEvent {
    /**
     * The time at which the event occurred, in milliseconds.
     */
    readonly time: number;
}
