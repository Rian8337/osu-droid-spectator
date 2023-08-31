/**
 * Represents a spectator event that is received from the server.
 */
export interface SpectatorEventData {
    /**
     * The time at which the event occurred, in milliseconds.
     */
    readonly time: number;

    /**
     * The score of the player after this event.
     */
    readonly score: number;

    /**
     * The combo of the player after this event.
     */
    readonly combo: number;

    /**
     * The accuracy of the player after this event, from 0 to 1.
     */
    readonly accuracy: number;
}
