import { SpectatorSyncedScoreEvent } from "../events/SpectatorSyncedScoreEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the synced score spectator event.
 */
export class SpectatorSyncedScoreEventManager extends SpectatorEventManager<SpectatorSyncedScoreEvent> {
    protected override readonly defaultEvent = new SpectatorSyncedScoreEvent(
        0,
        0
    );
}
