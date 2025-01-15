import { audioState } from "../../elements/Audio";
import { parsedBeatmap } from "../../settings/BeatmapSettings";

export default function () {
    if (!parsedBeatmap) {
        return;
    }

    const firstObject = parsedBeatmap.hitObjects.objects[0];

    audioState.audio.currentTime = Math.max(
        0,
        (firstObject.startTime - firstObject.timePreempt) / 1000,
    );
}
