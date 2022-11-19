import { audioState } from "./Audio";

(<JQuery<HTMLInputElement>>$("#volume")).on("change", function () {
    localStorage.setItem("volume", this.value);

    audioState.audio.volume = parseInt(this.value) / 100;
});
