import { audioState } from "../../elements/Audio";
import { MapStats } from "../../osu-base";
import { parsedBeatmap } from "../../settings/BeatmapSettings";

/**
 * A handler responsible for handling skip events.
 */
export abstract class SkipPerformedHandler {
    /**
     * Handles the event when a skip was performed.
     */
    static handle() {
        if (!parsedBeatmap) {
            return;
        }

        audioState.audio.currentTime = Math.max(
            0,
            (parsedBeatmap.hitObjects.objects[0].startTime -
                MapStats.arToMS(parsedBeatmap.difficulty.ar!)) /
                1000,
        );
    }
}
