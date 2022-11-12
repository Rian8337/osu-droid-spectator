import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever the player's score changes.
 */
export class SpectatorScoreEvent extends SpectatorEvent {
    /**
     * The score of the player.
     */
    readonly score: number;

    constructor(time: number, score: number) {
        super(time);

        this.score = score;
    }

    override isRedundant(existing: SpectatorScoreEvent): boolean {
        return this.score === existing.score;
    }
}
