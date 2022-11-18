import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever the player's accuracy changes.
 */
export class SpectatorAccuracyEvent extends SpectatorEvent {
    /**
     * The accuracy of the player, from 0 to 1.
     */
    readonly accuracy: number;

    /**
     * The index of the object at which this accuracy change happened.
     */
    readonly objectIndex: number;

    constructor(time: number, accuracy: number, objectIndex: number) {
        super(time);

        this.accuracy = accuracy;
        this.objectIndex = objectIndex;
    }

    override isRedundant(existing: SpectatorAccuracyEvent): boolean {
        return this.objectIndex === existing.objectIndex;
    }
}
