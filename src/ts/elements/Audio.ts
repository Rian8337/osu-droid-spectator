import { previews } from "../settings/PreviewSettings";
import { dataProcessor } from "../settings/SpectatorSettings";

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

            if (audio.src) {
                if (dataProcessor?.isAvailableAt(currentTime) && !audio.ended) {
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
}

/**
 * Sets the audio playback rate.
 * 
 * @param value The value to set.
 */
export function setAudioPlaybackRate(value: number): void {
    audio.playbackRate = value;
}
