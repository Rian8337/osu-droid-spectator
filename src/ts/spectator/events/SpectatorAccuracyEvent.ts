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
        // Comparing floating numbers directly is discouraged, but we have no choice here
        // otherwise we may miss some data.
        return this.accuracy === existing.accuracy;
    }
}
