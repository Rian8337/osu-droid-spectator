import { audioState } from "./Audio";

$("#play").on("click", function (e) {
    e.preventDefault();

    if ($(this).hasClass("e")) {
        $(audioState.audio).trigger("play");
    }
});
