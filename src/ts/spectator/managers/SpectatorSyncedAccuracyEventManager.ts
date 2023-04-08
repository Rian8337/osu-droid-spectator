import { SpectatorSyncedAccuracyEvent } from "../events/SpectatorSyncedAccuracyEvent";
import { SpectatorIndexedEventManager } from "./SpectatorIndexedEventManager";

/**
 * Represents a manager for the synced accuracy spectator event.
 */
export class SpectatorSyncedAccuracyEventManager extends SpectatorIndexedEventManager<SpectatorSyncedAccuracyEvent> {
    protected override readonly defaultEvent = new SpectatorSyncedAccuracyEvent(
        Number.NEGATIVE_INFINITY,
        1,
        -1
    );
    protected override getEventIndex(
        event: SpectatorSyncedAccuracyEvent
    ): number {
        return event.objectIndex;
    }
}
