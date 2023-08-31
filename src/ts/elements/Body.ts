import { audioState } from "./Audio";

$(document.body).on("mousemove", function (e) {
    if (e.clientY < 0.95 * innerHeight && e.clientY > 0.05 * innerHeight) {
        return;
    }

    const self = $(this);

    clearTimeout(self.data("h"));

    self.addClass("h").data(
        "h",
        setTimeout(() => {
            if (!audioState.audio.paused) {
                self.removeClass("h");
            }
        }, 1500),
    );
});
