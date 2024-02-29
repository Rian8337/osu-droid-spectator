import { convertApproachRateToMilliseconds } from "@rian8337/osu-base";
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

        audioState.audio.currentTime = Math.max(
            0,
            (parsedBeatmap.hitObjects.objects[0].startTime -
                convertApproachRateToMilliseconds(
                    parsedBeatmap.difficulty.ar ?? parsedBeatmap.difficulty.od,
                )) /
                1000,
        );
    }
}
