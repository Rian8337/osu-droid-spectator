import { setScorePortion } from "../../settings/RoomSettings";

/**
 * A handler responsible for handling score portion changed events.
 */
export abstract class ScorePortionChangedHandler {
    /**
     * Handles a score portion changed event.
     *
     * @param value The new score portion.
     */
    static handle(value: number): void {
        console.log("Score portion changed to", value);

        setScorePortion(value);
    }
}
