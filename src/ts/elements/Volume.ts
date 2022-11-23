import { audioState } from "./Audio";

const volume = $<HTMLInputElement>("#volume");
volume.on("change", function () {
    localStorage.setItem("volume", this.value);

    audioState.audio.volume = parseInt(this.value) / 100;
});

$(() => {
    const storedVolume = localStorage.getItem("volume") ?? "100";

    audioState.audio.volume = parseInt(storedVolume) / 100;
    volume.val(storedVolume);
});
