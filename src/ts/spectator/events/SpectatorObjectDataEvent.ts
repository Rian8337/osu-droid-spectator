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
    readonly currentScore: number;
    readonly currentCombo: number;
    readonly currentAccuracy: number;
    readonly accuracy: number;
    readonly tickset: boolean[];
    readonly result: HitResult;

    constructor(time: number, objectData: SpectatorObjectData) {
        super(time);

        this.index = objectData.index;
        this.accuracy = objectData.accuracy;
        this.tickset = objectData.tickset;
        this.result = objectData.result;
        this.currentAccuracy = objectData.currentAccuracy;
        this.currentCombo = objectData.currentCombo;
        this.currentScore = objectData.currentScore;
    }

    override isRedundant(existing: SpectatorObjectDataEvent): boolean {
        return this.index === existing.index;
    }
}
