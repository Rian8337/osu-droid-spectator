import { SpectatorAccuracyEvent } from "./SpectatorAccuracyEvent";

/**
 * Emitted whenever the player submits a spectator data.
 *
 * Used to sync accuracy in case a packet loss occurs.
 */
export class SpectatorSyncedAccuracyEvent extends SpectatorAccuracyEvent {
    override isRedundant(): boolean {
        // Synced events are never redundant as they are needed for syncing purposes.
        return false;
    }
}
