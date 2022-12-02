import { setDisplayScoreV2 } from "../settings/SpectatorSettings";

const checkbox = $<HTMLInputElement>("#displayScoreV2");

checkbox.on("change", (e) => {
    if (e.currentTarget.checked) {
        localStorage.setItem("displayScoreV2", "1");
    } else {
        localStorage.removeItem("displayScoreV2");
    }

    setDisplayScoreV2(e.currentTarget.checked);
});

$(() => {
    const storedState = Boolean(localStorage.getItem("displayScoreV2"));

    checkbox.prop("checked", storedState);
    setDisplayScoreV2(storedState);
});
