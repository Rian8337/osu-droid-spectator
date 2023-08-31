import { HitResult } from "../structures/HitResult";
import { SpectatorObjectData } from "../rawdata/SpectatorObjectData";
import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted when an object was hit or missed.
 */
export class SpectatorObjectDataEvent
    extends SpectatorEvent
    implements SpectatorObjectData
{
    readonly index: number;
    readonly accuracy: number;
    readonly tickset: boolean[];
    readonly result: HitResult;

    constructor(objectData: SpectatorObjectData) {
        super(objectData.time);

        this.index = objectData.index;
        this.accuracy = objectData.accuracy;
        this.tickset = objectData.tickset;
        this.result = objectData.result;
    }

    override isRedundant(existing: SpectatorObjectDataEvent): boolean {
        return this.index === existing.index;
    }
}
