import { Vector2 } from "../../osu-base";
import { MovementType } from "../rawdata/MovementType";
import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted when the player's cursor state changes.
 */
export interface SpectatorCursorEvent extends SpectatorEvent {
    /**
     * The position of the occurrence.
     */
    position: Vector2;

    /**
     * The movement ID of the occurrence.
     */
    id: MovementType;
}
