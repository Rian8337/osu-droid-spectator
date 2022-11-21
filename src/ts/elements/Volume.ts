import { audioState } from "./Audio";

(<JQuery<HTMLInputElement>>$("#volume"))
    .on("load", function () {
        // TODO: see why this doesn't work again
        this.value = localStorage.getItem("volume") ?? "100";

        audioState.audio.volume = parseInt(this.value) / 100;
    })
    .on("change", function () {
        localStorage.setItem("volume", this.value);

        audioState.audio.volume = parseInt(this.value) / 100;
    });
