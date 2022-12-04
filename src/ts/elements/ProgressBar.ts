import { previews } from "../settings/PreviewSettings";
import { dataProcessor } from "../settings/SpectatorSettings";
import { audioState } from "./Audio";

$<HTMLInputElement>("#progress").on("change", function () {
    let value = parseInt(this.value);

    if (dataProcessor) {
        // Don't forward too far if spectator data is not available yet.
        // Cap at latest event time.
        const latestEventTime = dataProcessor?.latestEventTime ?? 0;

        if (latestEventTime !== null && value > latestEventTime) {
            value = latestEventTime / 1000;
        }
    }

    audioState.audio.pause();

    this.value = value.toString();
    audioState.audio.currentTime = value;

    for (const preview of previews.values()) {
        preview.beatmap?.refresh();
    }
});
