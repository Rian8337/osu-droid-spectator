import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever the player's accuracy changes.
 */
export class SpectatorAccuracyEvent extends SpectatorEvent {
    /**
     * The accuracy of the player, from 0 to 1.
     */
    readonly accuracy: number;

    constructor(time: number, accuracy: number) {
        super(time);

        this.accuracy = accuracy;
    }

    override isRedundant(existing: SpectatorAccuracyEvent): boolean {
        return this.accuracy === existing.accuracy;
    }
}
