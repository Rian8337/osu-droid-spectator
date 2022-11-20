import { audioState } from "./Audio";

(<JQuery<HTMLInputElement>>$("#volume")).on("change", function () {
    // TODO: this should work but idk why it doesn't
    localStorage.setItem("volume", this.value);

    audioState.audio.volume = parseInt(this.value) / 100;
});
