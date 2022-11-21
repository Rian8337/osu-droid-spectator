import { SpectatorComboEvent } from "./SpectatorComboEvent";

/**
 * Emitted whenever the player submits a spectator data.
 *
 * Used to sync combo in case a packet loss occurs.
 */
export class SpectatorSyncedComboEvent extends SpectatorComboEvent {
    override isRedundant(): boolean {
        // Synced events are never redundant as they are needed for syncing purposes.
        return false;
    }
}
