import { previews } from "../settings/PreviewSettings";
import { dataProcessor } from "../settings/SpectatorSettings";
import { audioState } from "./Audio";

$<HTMLInputElement>("#progress").on("change", function () {
    // Don't go too far if spectator data is not available (yet).
    // Cap at latest event time.
    const value = Math.min(
        parseInt(this.value) * 1000,
        dataProcessor.latestEventTime ?? Number.POSITIVE_INFINITY,
    );

    audioState.audio.pause();

    this.value = (value / 1000).toString();
    audioState.audio.currentTime = value / 1000;

    for (const preview of previews.values()) {
        preview.beatmap?.refresh();
    }

    audioState.audio.play();
});
