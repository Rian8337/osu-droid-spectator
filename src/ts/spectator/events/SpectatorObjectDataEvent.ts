import { HitResult } from "../rawdata/HitResult";
import { SpectatorObjectData } from "../rawdata/SpectatorObjectData";
import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted when an object was hit or missed.
 */
export class SpectatorObjectDataEvent
    extends SpectatorEvent
    implements
        Omit<
            SpectatorObjectData,
            "currentScore" | "currentCombo" | "currentAccuracy"
        >
{
    readonly index: number;
    readonly accuracy: number;
    readonly tickset: boolean[];
    readonly result: HitResult;

    constructor(
        time: number,
        index: number,
        accuracy: number,
        tickset: boolean[],
        result: HitResult
    ) {
        super(time);

        this.index = index;
        this.accuracy = accuracy;
        this.tickset = tickset;
        this.result = result;
    }

    override isRedundant(existing: SpectatorObjectDataEvent): boolean {
        return this.index === existing.index;
    }
}
