import { MapStats, ModUtil } from "../osu-base";
import { previews } from "../settings/PreviewSettings";
import { speedMultiplier, requiredMods } from "../settings/RoomSettings";
import { dataProcessor, teamScoreDisplay } from "../settings/SpectatorSettings";

const audio = new Audio();

$(audio)
    .on("userinteraction", function () {
        $<HTMLButtonElement>("#play").removeClass("e");

        for (const preview of previews.values()) {
            preview.beatmap?.refresh();
        }

        this.currentTime = dataProcessor?.earliestEventTime ?? 0;
        audioState.audioLastPause = Date.now();

        $(this).trigger("play");
    })
    .on("play", () => {
        requestAnimationFrame(function foo() {
            const currentTime = audio.currentTime * 1000;

            if (!dataProcessor?.isAvailableAt(currentTime) || audio.ended) {
                audio.pause();
                return;
            }

            for (const preview of previews.values()) {
                preview.at(currentTime);
            }

            teamScoreDisplay?.draw(currentTime);
            requestAnimationFrame(foo);
        });
    })
    .on("pause", function () {
        audioState.audioLastPause = Date.now();

        if (!audio.ended) {
            const interval = setInterval(() => {
                if (dataProcessor?.isAvailableAt(this.currentTime * 1000)) {
                    clearInterval(interval);
                    this.play();
                }
            }, 1000);
        }
    })
    .on("durationchange", function () {
        $<HTMLInputElement>("#progress").val(0).prop("max", this.duration);
    })
    .on("timeupdate", function () {
        $<HTMLInputElement>("#progress").val(this.currentTime);
    });

export const audioState = {
    audio: audio,
    audioLastPause: Date.now(),

    /**
     * How long has it been since the audio was paused, in milliseconds.
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
        URL.revokeObjectURL(audio.src);
        audio.src = "";
    }

    audio.currentTime = 0;
    audioState.audioLastPause = Date.now();
    audio.volume = parseInt(localStorage.getItem("volume") ?? "100") / 100;
    setAudioPlaybackRate();
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
