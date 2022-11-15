import settings from "../Settings";

const audio = new Audio();

$(audio)
    .on("play", () => {
        $("#play").removeClass("e");
        for (const preview of settings.previews.values()) {
            preview.beatmap.refresh();
        }

        requestAnimationFrame(function foo() {
            const currentTime = audio.currentTime * 1000;
            if (
                settings.processor?.isAvailableAt(currentTime) &&
                !audio.ended
            ) {
                audio.play();
            } else if (!audio.ended) {
                audio.pause();
            }

            if (!audio.paused) {
                for (const preview of settings.previews.values()) {
                    preview.at(audio.currentTime * 1000);
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

export default audio;
