import { ModUtil } from "@rian8337/osu-base";
import { previews } from "../settings/PreviewSettings";
import { speedMultiplier, mods } from "../settings/RoomSettings";
import {
    getBackgroundDim,
    dataProcessor,
    infoDisplay,
} from "../settings/SpectatorSettings";

const audio = new Audio();
let playbackInterval: NodeJS.Timeout | null = null;

const container = $("#container")[0];
const backgroundDimElement = $(getBackgroundDim());

$(audio)
    .on("userinteraction", function () {
        $<HTMLButtonElement>("#play").removeClass("e");

        for (const preview of previews.values()) {
            preview.beatmap?.refresh();
        }

        audioState.audioLastPause = Date.now();

        $(this).trigger("pause");
    })
    .on("play", () => {
        requestAnimationFrame(function foo() {
            const currentTime = audio.currentTime * 1000;
            infoDisplay.draw(currentTime);

            if (!dataProcessor.isAvailableAt(currentTime) || audio.ended) {
                $(audio).trigger("manualpause");
                return;
            }

            if (playbackInterval) {
                console.log("Playback interval automatically stopped");
                clearInterval(playbackInterval);
                playbackInterval = null;
            }

            for (const preview of previews.values()) {
                preview.at(currentTime);
            }

            backgroundDimElement.remove();
            requestAnimationFrame(foo);
        });
    })
    .on("manualpause", function () {
        this.pause();
        audioState.audioLastPause = Date.now();

        container.append(getBackgroundDim());

        if (!audio.ended && !playbackInterval) {
            console.log("Playback interval started");

            playbackInterval = setInterval(() => {
                if ($<HTMLButtonElement>("#play").hasClass("e")) {
                    return;
                }

                if (
                    dataProcessor.earliestEventTime !== null &&
                    this.currentTime * 1000 < dataProcessor.earliestEventTime
                ) {
                    this.currentTime = dataProcessor.earliestEventTime / 1000;
                }

                if (
                    dataProcessor.isAvailableAt(this.currentTime * 1000) &&
                    this.src
                ) {
                    console.log("Playback interval stopped");
                    clearInterval(playbackInterval!);
                    playbackInterval = null;

                    this.play().catch((e: unknown) => {
                        console.error(e);
                        $(this).trigger("manualpause");
                    });
                }
            }, 250);
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
        return audio.paused ? Date.now() - this.audioLastPause : 0;
    },
};

/**
 * Resets the state of the audio player.
 */
export function resetAudio(resetSrc: boolean): void {
    audio.pause();
    audioState.audioLastPause = Date.now();

    if (resetSrc) {
        URL.revokeObjectURL(audio.src);
        audio.src = "";
    }

    audio.currentTime = 0;
    audio.volume = parseInt(localStorage.getItem("volume") ?? "100") / 100;
    setAudioPlaybackRate();
}

/**
 * Sets the audio playback rate based on currently set required mods and speed multiplier.
 */
export function setAudioPlaybackRate(): void {
    audio.playbackRate = speedMultiplier * ModUtil.calculateRateWithMods(mods);
}
