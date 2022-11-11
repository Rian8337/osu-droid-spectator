import { MovementType } from "../../enums/MovementType";
import { SpectatorCursorPosition } from "./SpectatorCursorPosition";

/**
 * Represents spectator cursor data to be sent to the spectator client.
 */
export interface SpectatorCursorData {
    /**
     * The time of this occurrence.
     */
    time: number;

    /**
     * The position of the occurrence.
     */
    position: SpectatorCursorPosition;

    /**
     * The movement ID of the occurrence.
     */
    id: MovementType;
}
