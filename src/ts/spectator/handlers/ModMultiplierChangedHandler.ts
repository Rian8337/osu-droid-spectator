import { ModUtil } from "../../osu-base";
import settings from "../../Settings";

/**
 * A handler responsible for handling mod score multiplier changed events.
 */
export abstract class ModMultiplierChangeHandler {
    /**
     * Handles the event when a mod multiplier changes.
     *
     * @param mods The mods multipliers are set to.
     * @param value The score multiplier value of the mod.
     */
    static handle(mods: string, value: number): void {
        console.log("Mod multiplier changed");

        for (const mod of ModUtil.pcStringToMods(mods)) {
            if (!mod.isApplicableToDroid()) {
                continue;
            }

            settings.modMultipliers[mod.acronym] = value;
        }
    }
}
