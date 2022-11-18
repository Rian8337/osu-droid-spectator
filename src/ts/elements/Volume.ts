import { audioState } from "./Audio";

(<JQuery<HTMLInputElement>>$("#volume")).on("change", function () {
    // TODO: store current volume in localStorage
    audioState.audio.volume = parseInt(this.value) / 100;
});
