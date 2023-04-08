import { SpectatorSyncedComboEvent } from "../events/SpectatorSyncedComboEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the synced combo spectator event.
 */
export class SpectatorSyncedComboEventManager extends SpectatorEventManager<SpectatorSyncedComboEvent> {
    protected override readonly defaultEvent = new SpectatorSyncedComboEvent(
        Number.NEGATIVE_INFINITY,
        0
    );
}
