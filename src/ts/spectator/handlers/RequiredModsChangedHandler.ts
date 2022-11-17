import { setAudioPlaybackRate } from "../../elements/Audio";
import { MapStats, ModUtil } from "../../osu-base";
import { setRequiredMods, speedMultiplier } from "../../settings/RoomSettings";

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

        setRequiredMods(mods);

        const stats = new MapStats({
            speedMultiplier: speedMultiplier,
            mods: ModUtil.pcStringToMods(mods),
        }).calculate();

        setAudioPlaybackRate(stats.speedMultiplier);
    }
}
