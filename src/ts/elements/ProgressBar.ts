import { dataProcessor } from "../settings/SpectatorSettings";
import { audioState } from "./Audio";

(<JQuery<HTMLInputElement>>$("#progress")).on("change", function () {
    let value = parseInt(this.value);

    if (dataProcessor) {
        // Don't forward too far if spectator data is not available yet.
        // Cap at latest event time.
        const { latestEventTime } = dataProcessor;

        if (latestEventTime !== null && value > latestEventTime) {
            value = latestEventTime / 1000;
        }
    }

    this.value = value.toString();
    audioState.audio.currentTime = value;
    $(audioState.audio).trigger("play");
});
