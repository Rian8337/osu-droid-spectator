import { SpectatorScoreEvent } from "./SpectatorScoreEvent";

/**
 * Emitted whenever the player submits a spectator data.
 *
 * Used to sync score in case a packet loss occurs.
 */
export class SpectatorSyncedScoreEvent extends SpectatorScoreEvent {
    override isRedundant(): boolean {
        // Synced events are never redundant as they are needed for syncing purposes.
        return false;
    }
}
