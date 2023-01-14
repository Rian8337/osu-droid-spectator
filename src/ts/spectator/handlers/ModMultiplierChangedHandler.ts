import { setModMultipliers } from "../../settings/RoomSettings";

/**
 * A handler responsible for handling mod score multiplier changed events.
 */
export abstract class ModMultiplierChangeHandler {
    /**
     * Handles the event when mod multipliers change.
     *
     * @param newMultipliers The new mod multipliers.
     */
    static handle(newMultipliers: Record<string, number>): void {
        console.log("Mod multipliers changed");

        setModMultipliers(newMultipliers);
    }
}
