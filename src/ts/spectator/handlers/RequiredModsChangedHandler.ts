import { setRequiredMods } from "../../settings/RoomSettings";

/**
 * A handler responsible for handling required mods changed events.
 */
export abstract class RequiredModsChangedHandler {
    /**
     * Handles a required mods changed event.
     *
     * @param mods The new required mods.
     */
    static handle(mods: string): void {
        console.log("Required mods changed to", mods || "NM");

        setRequiredMods(mods);
    }
}
