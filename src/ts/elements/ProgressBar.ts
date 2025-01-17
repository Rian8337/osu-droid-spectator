import { previews } from "../settings/PreviewSettings";
import { dataProcessor } from "../settings/SpectatorSettings";
import { audioState } from "./Audio";
import { parsedBeatmap } from "../settings/BeatmapSettings";

// eslint-disable-next-line @typescript-eslint/no-misused-promises
$<HTMLInputElement>("#progress").on("change", async function () {
    let value = parseInt(this.value) * 1000;

    // Don't go too behind or too far if spectator data is not available (yet).
    // Cap at earliest and latest event time when necessary.
    if (parsedBeatmap) {
        const finalObjectEndTime =
            parsedBeatmap.hitObjects.objects[
                parsedBeatmap.hitObjects.objects.length - 1
            ].endTime;

        // Do not cap if the user seeks to after the beatmap ends.
        if (value < finalObjectEndTime) {
            value = Math.min(value, dataProcessor.latestEventTime ?? 0);
        }
    } else {
        value = Math.min(value, dataProcessor.latestEventTime ?? 0);
    }

    value = Math.max(value, dataProcessor.earliestEventTime ?? 0);

    audioState.audio.pause();

    this.value = (value / 1000).toString();
    audioState.audio.currentTime = value / 1000;

    for (const preview of previews.values()) {
        preview.beatmap?.refresh();
    }

    if (dataProcessor.isAvailableAt(value)) {
        await audioState.audio.play();
    }
});
