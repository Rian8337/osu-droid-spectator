import { audioState } from "../../elements/Audio";
import { MapStats, ModUtil } from "../../osu-base";
import { requiredMods, setSpeedMultiplier } from "../../settings/RoomSettings";

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

        const stats = new MapStats({
            speedMultiplier: speedMultiplier,
            mods: ModUtil.pcStringToMods(requiredMods),
        });

        audioState.audio.playbackRate = stats.speedMultiplier;
    }
}
