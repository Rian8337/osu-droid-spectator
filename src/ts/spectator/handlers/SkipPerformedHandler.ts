import { audioState } from "../../elements/Audio";
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

        const firstObject = parsedBeatmap.hitObjects.objects[0];

        audioState.audio.currentTime = Math.max(
            0,
            (firstObject.startTime - firstObject.timePreempt) / 1000,
        );
    }
}
