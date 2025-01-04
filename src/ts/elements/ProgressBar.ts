import { MathUtils } from "@rian8337/osu-base";
import { previews } from "../settings/PreviewSettings";
import { dataProcessor } from "../settings/SpectatorSettings";
import { audioState } from "./Audio";

$<HTMLInputElement>("#progress").on("change", function () {
    // Don't go too behind or too far if spectator data is not available (yet).
    // Cap at earliest and latest event time.
    const value = MathUtils.clamp(
        parseInt(this.value) * 1000,
        dataProcessor.earliestEventTime ?? 0,
        dataProcessor.latestEventTime ?? 0,
    );

    audioState.audio.pause();

    this.value = (value / 1000).toString();
    audioState.audio.currentTime = value / 1000;

    for (const preview of previews.values()) {
        preview.beatmap?.refresh();
    }

    audioState.audio.play();
});
