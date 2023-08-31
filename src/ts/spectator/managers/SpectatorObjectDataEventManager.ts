import { SpectatorObjectDataEvent } from "../events/SpectatorObjectDataEvent";
import { HitResult } from "../structures/HitResult";
import { SpectatorIndexedEventManager } from "./SpectatorIndexedEventManager";

/**
 * A manager for object data events.
 */
export class SpectatorObjectDataEventManager extends SpectatorIndexedEventManager<SpectatorObjectDataEvent> {
    protected override readonly defaultEvent = new SpectatorObjectDataEvent({
        time: Number.NEGATIVE_INFINITY,
        accuracy: 0,
        index: -1,
        result: HitResult.great,
        tickset: [],
    });

    protected override getEventIndex(event: SpectatorObjectDataEvent): number {
        return event.index;
    }
}
