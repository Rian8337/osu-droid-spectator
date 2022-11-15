import audio from "../../elements/Audio";
import { MapStats, ModUtil } from "../../osu-base";
import settings from "../../Settings";

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
        console.log("Required mods changed");

        settings.requiredMods = mods;

        const stats = new MapStats({
            speedMultiplier: settings.speedMultiplier,
            mods: ModUtil.pcStringToMods(settings.requiredMods),
        });

        audio.playbackRate = stats.speedMultiplier;
    }
}
