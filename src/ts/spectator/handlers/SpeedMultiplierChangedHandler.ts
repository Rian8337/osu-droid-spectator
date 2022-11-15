import audio from "../../elements/Audio";
import { MapStats, ModUtil } from "../../osu-base";
import settings from "../../Settings";

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

        settings.speedMultiplier = speedMultiplier;

        const stats = new MapStats({
            speedMultiplier: settings.speedMultiplier,
            mods: ModUtil.pcStringToMods(settings.requiredMods),
        });

        audio.playbackRate = stats.speedMultiplier;
    }
}
