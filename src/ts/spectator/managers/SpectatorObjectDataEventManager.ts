import { SpectatorObjectDataEvent } from "../events/SpectatorObjectDataEvent";
import { SpectatorEventManager } from "../managers/SpectatorEventManager";
import { HitResult } from "../structures/HitResult";

/**
 * A manager for object data events.
 */
export class SpectatorObjectDataEventManager extends SpectatorEventManager<SpectatorObjectDataEvent> {
    override readonly defaultEvent = new SpectatorObjectDataEvent(
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
    misses = 0;

    override add(...events: SpectatorObjectDataEvent[]): void {
        for (const event of events) {
            if (this._events.at(event.index)?.result === HitResult.miss) {
                --this.misses;
            }

            if (event.result === HitResult.miss) {
                ++this.misses;
            }

            this._events[event.index] = event;
        }
    }

    constructor(objectCount: number) {
        super();

        this._events = new Array(objectCount);
    }

    /**
     * Finds the object data event at the given index.
     *
     * @param index The index of the event.
     * @returns The object data event, `null` if none found.
     */
    override eventAt(index: number): SpectatorObjectDataEvent | null {
        return this._events[index] ?? null;
    }
}
