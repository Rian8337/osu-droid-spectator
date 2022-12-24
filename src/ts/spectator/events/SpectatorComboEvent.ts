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
        return this.combo === existing.combo;
    }
}
