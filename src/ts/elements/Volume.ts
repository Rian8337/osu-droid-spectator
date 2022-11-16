import { audioState } from "./Audio";

(<JQuery<HTMLInputElement>>$("#volume")).on("change", function () {
    audioState.audio.volume = parseInt(this.value) / 100;
});
