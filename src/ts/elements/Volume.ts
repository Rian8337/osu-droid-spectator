import audio from "./Audio";

(<JQuery<HTMLInputElement>>$("#volume")).on("change", function () {
    audio.volume = parseInt(this.value) / 100;
});
