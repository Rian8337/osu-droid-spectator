import { audioState } from "./Audio";

$(document.body).on("mousemove", function (e) {
    const self = $(this);

    if ((e.clientY >= 0.95 * innerHeight || e.clientY <= 0.05 * innerHeight)) {
        clearTimeout(self.data("h"));

        self.addClass("h").data(
            "h",
            setTimeout(() => {
                if (!audioState.audio.paused) {
                    self.removeClass("h");
                }
            }, 2000)
        );
    }
});