import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever the player's spectator data gets sent.
 *
 * This is only used for syncing purposes.
 */
export interface SpectatorComboEvent extends SpectatorEvent {
    /**
     * The combo of the player.
     */
    readonly combo: number;
}
