import { MapStats, ModUtil } from "../osu-base";
import { previews } from "../settings/PreviewSettings";
import { speedMultiplier, requiredMods } from "../settings/RoomSettings";
import { dataProcessor, teamScoreDisplay } from "../settings/SpectatorSettings";

const audio = new Audio();
let firstPlayback = true;

$(audio)
    .on("userinteraction", () => {
        $("#play").removeClass("e");

        for (const preview of previews.values()) {
            preview.beatmap?.refresh();
        }

        if (firstPlayback) {
            audio.currentTime = dataProcessor?.earliestEventTime ?? 0;
            audioState.audioLastPause = Date.now();
            firstPlayback = false;
        }

        // TODO: add logic to fast-forward to earliest available event time for several cases
        // (i.e. spectator client is refreshed in the middle of a round)
        requestAnimationFrame(async function foo() {
            const currentTime = audio.currentTime * 1000;

            if (audio.src) {
                if (dataProcessor?.isAvailableAt(currentTime) && !audio.ended) {
                    await audio.play();
                } else {
                    if (!audio.paused && !audio.ended) {
                        audioState.audioLastPause = Date.now();
                    }

                    audio.pause();
                }

                if (!audio.paused) {
                    for (const preview of previews.values()) {
                        preview.at(currentTime);
                    }

                    teamScoreDisplay?.draw(currentTime);
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
    firstPlayback = true;
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
