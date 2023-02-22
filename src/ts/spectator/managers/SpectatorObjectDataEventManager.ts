import { SpectatorObjectDataEvent } from "../events/SpectatorObjectDataEvent";
import { HitResult } from "../structures/HitResult";
import { SpectatorIndexedEventManager } from "./SpectatorIndexedEventManager";

/**
 * A manager for object data events.
 */
export class SpectatorObjectDataEventManager extends SpectatorIndexedEventManager<SpectatorObjectDataEvent> {
    protected override readonly defaultEvent = new SpectatorObjectDataEvent(
        Number.NEGATIVE_INFINITY,
        {
            accuracy: 0,
            currentAccuracy: 1,
            currentCombo: 0,
            currentScore: 0,
            index: -1,
            result: HitResult.great,
            tickset: [],
        }
    );

    /**
     * The amount of misses achieved.
     *
     * Used for calculating display score v2.
     */
    misses?: number;

    override add(...events: SpectatorObjectDataEvent[]): void {
        this.misses ??= 0;

        for (const event of events) {
            if (this._events.at(event.index)?.result === HitResult.miss) {
                --this.misses;
            }

            if (event.result === HitResult.miss) {
                ++this.misses;
            }

            super.add(event);
        }
    }

    protected override getEventIndex(event: SpectatorObjectDataEvent): number {
        return event.index;
    }
}
