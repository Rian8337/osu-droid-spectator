import settings from "../Settings";
import audio from "./Audio";

(<JQuery<HTMLInputElement>>$("#progress")).on("change", function () {
    const value = parseInt(this.value);

    if (settings.processor) {
        // Don't forward too far if spectator data is not available yet.
        // Cap at latest event time.
        const { latestEventTime } = settings.processor;

        if (latestEventTime !== null && value < latestEventTime) {
            this.value = (latestEventTime / 1000).toString();
            return;
        }
    }

    audio.currentTime = value;
    audio.play();
});
