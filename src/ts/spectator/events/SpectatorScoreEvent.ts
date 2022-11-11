import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever the player's spectator data gets sent.
 *
 * This is only used for syncing purposes.
 */
export interface SpectatorScoreEvent extends SpectatorEvent {
    /**
     * The score of the player.
     */
    readonly score: number;
}
