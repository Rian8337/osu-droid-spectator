import { SpectatorObjectDataEvent } from "./events/SpectatorObjectDataEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * A manager for object data events.
 */
export class SpectatorObjectDataEventManager extends SpectatorEventManager<SpectatorObjectDataEvent> {
    override add(...events: SpectatorObjectDataEvent[]): void {
        for (const event of events) {
            this._events.splice(event.index, 0, event);
        }
    }

    /**
     * Finds the object data event at the given index.
     *
     * @param index The index of the event.
     * @returns The object data event, `null` if none found.
     */
    eventAt(index: number): SpectatorObjectDataEvent | null {
        return this._events[index] ?? null;
    }
}
