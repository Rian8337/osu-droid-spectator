import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever the player's spectator data gets sent.
 *
 * This is only used for syncing purposes.
 */
export interface SpectatorAccuracyEvent extends SpectatorEvent {
    /**
     * The accuracy of the player, from 0 to 1.
     */
    readonly accuracy: number;
}
