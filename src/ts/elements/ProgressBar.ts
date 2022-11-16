import { dataProcessor } from "../settings/SpectatorSettings";
import { audioState } from "./Audio";

(<JQuery<HTMLInputElement>>$("#progress")).on("change", function () {
    const value = parseInt(this.value);

    if (dataProcessor) {
        // Don't forward too far if spectator data is not available yet.
        // Cap at latest event time.
        const { latestEventTime } = dataProcessor;

        if (latestEventTime !== null && value > latestEventTime) {
            this.value = (latestEventTime / 1000).toString();
            return;
        }
    }

    audioState.audio.currentTime = value;
    $(audioState.audio).trigger("play");
});
