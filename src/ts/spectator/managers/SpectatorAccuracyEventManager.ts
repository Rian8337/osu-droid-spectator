import { SpectatorAccuracyEvent } from "../events/SpectatorAccuracyEvent";
import { SpectatorIndexedEventManager } from "./SpectatorIndexedEventManager";

/**
 * Represents a manager for the accuracy spectator event.
 */
export class SpectatorAccuracyEventManager extends SpectatorIndexedEventManager<SpectatorAccuracyEvent> {
    override readonly defaultEvent = new SpectatorAccuracyEvent(0, 1, -1);
    protected override getEventIndex(event: SpectatorAccuracyEvent): number {
        return event.objectIndex;
    }
}
