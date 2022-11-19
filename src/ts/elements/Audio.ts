import { MapStats, ModUtil } from "../osu-base";
import { previews } from "../settings/PreviewSettings";
import { speedMultiplier, requiredMods } from "../settings/RoomSettings";
import {
    dataProcessor,
    teamScoreCounters,
} from "../settings/SpectatorSettings";

const audio = new Audio();

$(audio)
    .on("play", () => {
        $("#play").removeClass("e");

        for (const preview of previews.values()) {
            preview.beatmap?.refresh();
        }

        requestAnimationFrame(function foo() {
            const currentTime = audio.currentTime * 1000;
            if (currentTime === 0) {
                audioState.audioLastPause = Date.now();
            }

            // TODO: add logic to fast-forward to earliest available event time for several cases
            // (i.e. spectator client is refreshed in the middle of a round)
            // TODO: investigate "element has no source" cause
            if (audio.src) {
                if (dataProcessor?.isAvailableAt(currentTime) && !audio.ended) {
                    // Investigate why this is still being called even though there's no source.
                    audio.play();
                } else {
                    if (!audio.paused) {
                        audioState.audioLastPause = Date.now();
                    }

                    audio.pause();
                }

                if (!audio.paused) {
                    for (const preview of previews.values()) {
                        preview.at(currentTime);
                    }

                    for (const counter of teamScoreCounters.values()) {
                        counter.draw(currentTime);
                    }
                }
            }

            requestAnimationFrame(foo);
        });
    })
    .on("durationchange", function () {
        $("#progress").val(0).prop("max", this.duration);
        $("#volume").trigger("change");
        $("#speed .e").trigger("click");
    })
    .on("timeupdate", function () {
        $("#progress").val(this.currentTime);
    });

$(document.body).on("mousemove", function () {
    const self = $(this);

    clearTimeout(self.data("h"));

    self.addClass("h").data(
        "h",
        setTimeout(() => {
            if (!audio.paused) {
                self.removeClass("h");
            }
        }, 3000)
    );
});

export const audioState = {
    audio: audio,
    audioLastPause: Date.now(),

    /**
     * The duration of the pause of the audio.
     */
    get pauseDuration(): number {
        return Date.now() - this.audioLastPause;
    },
};

/**
 * Resets the state of the audio player.
 */
export function resetAudio(resetSrc: boolean): void {
    audio.pause();

    if (resetSrc) {
        audio.src = "";
    }

    audio.currentTime = 0;
    audioState.audioLastPause = Date.now();
    audio.volume = parseFloat(localStorage.getItem("volume") ?? "100") / 100;
}

/**
 * Sets the audio playback rate based on currently set required mods and speed multiplier.
 */
export function setAudioPlaybackRate(): void {
    const stats = new MapStats({
        speedMultiplier: speedMultiplier,
        mods: ModUtil.pcStringToMods(requiredMods),
    }).calculate();

    audio.playbackRate = stats.speedMultiplier;
}
