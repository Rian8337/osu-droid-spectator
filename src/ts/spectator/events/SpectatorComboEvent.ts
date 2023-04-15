import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever the player's combo changes.
 */
export class SpectatorComboEvent extends SpectatorEvent {
    /**
     * The combo of the player.
     */
    readonly combo: number;

    constructor(time: number, combo: number) {
        super(time);

        this.combo = combo;
    }

    override isRedundant(existing: SpectatorComboEvent): boolean {
        // Combo is only redundant if it's not 0, as 0 combo indicates a miss from the player.
        return this.combo > 0 && this.combo === existing.combo;
    }
}
