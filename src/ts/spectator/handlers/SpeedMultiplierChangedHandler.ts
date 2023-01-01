import { setSpeedMultiplier } from "../../settings/RoomSettings";

/**
 * A handler responsible for handling speed multiplier changed events.
 */
export abstract class SpeedMultiplierChangedHandler {
    /**
     * Handles a speed multiplier changed event.
     *
     * @param speedMultiplier The new speed multiplier.
     */
    static handle(speedMultiplier: number): void {
        console.log("Speed multiplier changed");

        setSpeedMultiplier(speedMultiplier);
    }
}
