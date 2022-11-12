import { Vector2 } from "../../osu-base";
import { MovementType } from "../rawdata/MovementType";
import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted when the player's cursor state changes.
 */
export class SpectatorCursorEvent extends SpectatorEvent {
    /**
     * The position of the occurrence.
     */
    readonly position: Vector2;

    /**
     * The movement ID of the occurrence.
     */
    readonly id: MovementType;

    constructor(time: number, position: Vector2, id: MovementType) {
        super(time);

        this.position = position;
        this.id = id;
    }

    override isRedundant(): boolean {
        // Cursor moves are never redundant as they are a necessity when spectating.
        // Additionally, redundant cursor movements are already filtered in-game.
        return false;
    }
}
