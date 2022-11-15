import audio from "./Audio";

$("#play").on("click", function (e) {
    e.preventDefault();

    if ($(this).hasClass("e")) {
        audio.play();
    } else {
        audio.pause();
    }
});
