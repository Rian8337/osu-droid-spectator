import { SpectatorSyncedAccuracyEvent } from "../events/SpectatorSyncedAccuracyEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the synced accuracy spectator event.
 */
export class SpectatorSyncedAccuracyEventManager extends SpectatorEventManager<SpectatorSyncedAccuracyEvent> {
    protected override readonly defaultEvent = new SpectatorSyncedAccuracyEvent(
        Number.NEGATIVE_INFINITY,
        1,
    );
}
